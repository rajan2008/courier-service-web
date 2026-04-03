const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { authenticateToken, authMiddleware } = require('../middleware/authMiddleware');

// Get all users (Super Admin sees all, Courier Admin sees their own)
router.get('/', authenticateToken, authMiddleware(['admin', 'courier_admin']), async (req, res) => {
    try {
        let query = 'SELECT id, name, email, role, courier_owner, created_at, phone FROM users';
        let params = [];

        if (req.user.role === 'courier_admin') {
            query += ' WHERE courier_owner = $1';
            params = [req.user.courier_owner];
        }

        query += ' ORDER BY created_at DESC';
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create a new user (Admin only)
router.post('/', authenticateToken, authMiddleware(['admin']), async (req, res) => {
    const { name, email, password, role, phone, courier_owner } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            `INSERT INTO users (name, email, password, role, phone, courier_owner) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, email, hashedPassword, role, phone || null, courier_owner || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Delete a user (Admin only)
router.delete('/:id', authenticateToken, authMiddleware(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, email, role, courier_owner, phone, profile_photo FROM users WHERE id = $1',
            [req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update profile photo and basic info
router.put('/profile', authenticateToken, async (req, res) => {
    const { name, phone, profile_photo } = req.body;
    console.log(`Updating profile for user ID: ${req.user.id}`);
    try {
        const result = await db.query(
            `UPDATE users SET name = $1, phone = $2, profile_photo = $3 
             WHERE id = $4 RETURNING id, name, email, role, phone, profile_photo, courier_owner`,
            [name, phone, profile_photo, req.user.id]
        );

        if (result.rows.length === 0) {
            console.error('User not found for update');
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (err) {
        console.error('ERROR UPDATING PROFILE:', err);
        res.status(500).json({ error: 'Failed to update profile: ' + err.message });
    }
});

module.exports = router;
