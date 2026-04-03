const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');

const SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Helper to send OTP email
const sendOtpEmail = async (email, otp, subject) => {
  const text = `Hello,

Your One-Time Password (OTP) for Shipique is: ${otp}

This OTP is valid for 10 minutes. For your security, please do not share this code with anyone.

If you did not request this OTP, you can safely ignore this email.

Best regards,
Shipique Team

(Fallback DEV Note: OTP is ${otp})`;
  await sendEmail(email, subject, text);
};


// =================== SIGNUP (Step 1: Create Pending User & Send OTP) ===================
router.post('/signup', async (req, res) => {
  const {
    name, email, password, role, courier_owner, phone,
    courier_name
  } = req.body;

  try {
    // 1. Check if user already exists in MAIN users table
    const checkMain = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkMain.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // 2. Check if user already exists in PENDING users table (delete old pending if expired or just overwrite)
    await db.query('DELETE FROM pending_users WHERE email = $1', [email]);

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalCourierOwner = (role === 'courier_admin' || role === 'employee') ? courier_name : courier_owner;

    // Phone Validation (10 Digits)
    const phoneRegex = /^\d{10}$/;
    if (phone && !phoneRegex.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }

    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 mins

    // 4. Insert into PENDING Users
    const result = await db.query(
      `INSERT INTO pending_users (name, email, password, role, courier_owner, phone, otp, otp_expiry)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email`,
      [name, email, hashedPassword, role || "customer", finalCourierOwner || null, phone || null, otp, otpExpiry]
    );

    // 5. Send Email
    const pendingUser = result.rows[0];
    await sendOtpEmail(pendingUser.email, otp, 'Verify your Account - Shipique');

    res.status(201).json({
      message: "OTP sent to email. Please verify to complete signup.",
      userId: pendingUser.id, // This is the ID from pending_users table
      email: pendingUser.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed: ' + err.message });
  }
});

// =================== VERIFY SIGNUP OTP (Step 2) ===================
router.post('/verify-otp', async (req, res) => {
  const { userId, otp } = req.body; // userId here corresponds to pending_users.id

  try {
    // 1. Find in PENDING table
    const result = await db.query('SELECT * FROM pending_users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Verification session expired or invalid.' });

    const pendingUser = result.rows[0];

    // 2. Validate OTP
    if (pendingUser.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > new Date(pendingUser.otp_expiry)) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // 3. Move to MAIN Users table
    // Double check if email exists in main table (race condition)
    const checkMain = await db.query('SELECT * FROM users WHERE email = $1', [pendingUser.email]);
    if (checkMain.rows.length > 0) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const newUser = await db.query(
      `INSERT INTO users (name, email, password, role, courier_owner, phone, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING id, email, role`,
      [pendingUser.name, pendingUser.email, pendingUser.password, pendingUser.role, pendingUser.courier_owner, pendingUser.phone]
    );

    // 4. Delete from Pending
    await db.query('DELETE FROM pending_users WHERE id = $1', [userId]);

    res.json({ message: "Email verified successfully! Account created. You can now login." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed: ' + err.message });
  }
});

// =================== LOGIN ===================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1 OR courier_owner = $1`,
      [email]
    );

    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid login ID' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    // Check Verification
    if (!user.is_verified) {
      return res.status(403).json({ error: "Email not verified. Please verify your email first." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, courier_owner: user.courier_owner },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        courier_owner: user.courier_owner,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =================== FORGOT PASSWORD (Step 1: Request OTP) ===================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 mins

    await db.query(
      `UPDATE users SET otp = $1, otp_expiry = $2 WHERE id = $3`,
      [otp, otpExpiry, user.id]
    );

    await sendOtpEmail(user.email, otp, 'Reset Password OTP - Shipique');

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// =================== VERIFY RESET OTP (Step 2: Check & Get Token) ===================
router.post('/verify-reset-otp', async (req, res) => {
  const { email, otp } = req.body; // Changed to accept email + OTP

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];

    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (new Date() > new Date(user.otp_expiry)) return res.status(400).json({ error: "OTP expired" });

    // Success: Generate a temporary 'Password Reset Token'
    const resetToken = jwt.sign({ id: user.id, type: 'reset' }, SECRET, { expiresIn: '15m' });

    // Clear OTP immediately so it can't be reused differently
    await db.query('UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = $1', [user.id]);

    res.json({ message: "OTP Verified", resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// =================== RESET PASSWORD (Step 3: New Password) ===================
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const decoded = jwt.verify(resetToken, SECRET);
    if (decoded.type !== 'reset') return res.status(400).json({ error: "Invalid token type" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password=$1 WHERE id=$2", [
      hashedPassword,
      decoded.id,
    ]);

    res.json({ message: "Password has been reset successfully!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;
