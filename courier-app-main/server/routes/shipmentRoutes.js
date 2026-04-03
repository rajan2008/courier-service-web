const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken, authMiddleware } = require("../middleware/authMiddleware");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { sendEmail } = require("../utils/email");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_fallback",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "fallback_secret"
});

// ================= Customer APIs =================

// Create a new shipment (Customer booking)
router.post("/", authenticateToken, async (req, res) => {
  const {
    partner_awb,
    courier_owner,
    pickup_pincode,
    delivery_pincode,
    weight,
    price,
    sender_name,
    sender_address,
    sender_phone,
    receiver_name,
    receiver_address,
    receiver_phone,
  } = req.body;

  const user_id = req.user.id;
  // Use the user's courier_owner if they are an employee/admin and didn't specify one
  const finalCourierOwner = courier_owner || req.user.courier_owner;

  // Validation
  if (!pickup_pincode || !delivery_pincode || !weight || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!sender_name || !receiver_name) {
    return res.status(400).json({ error: "Sender and receiver names are required" });
  }

  // Phone Validation (10 Digits)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(sender_phone.replace(/\D/g, '')) || !phoneRegex.test(receiver_phone.replace(/\D/g, ''))) {
    return res.status(400).json({ error: "Phone numbers must be exactly 10 digits" });
  }

  // Razorpay Payment Verification
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "fallback_secret")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }
  } else {
    return res.status(400).json({ error: "Payment verification failed. Please complete payment." });
  }

  try {
    const chainId = Math.floor(1000 + Math.random() * 9000); // 4-digit chain ID

    // Helper to get 3-letter city code
    const getCityCode = (city) => {
      if (!city) return "GEN";
      const clean = city.trim().toUpperCase();
      if (clean.includes("AHMEDABAD")) return "AHM";
      if (clean.includes("VADODARA")) return "VAD";
      if (clean.includes("SURAT")) return "SUR";
      if (clean.includes("RAJKOT")) return "RAJ";
      if (clean.includes("GANDHINAGAR")) return "GNR";
      return clean.substring(0, 3);
    };

    const cityCode = getCityCode(req.body.receiver_city || req.body.sender_city);

    const result = await db.query(
      `SELECT COUNT(*) FROM shipments WHERE created_at::date = CURRENT_DATE`
    );

    const count = parseInt(result.rows[0].count) + 1;
    const local_awb = `MC-${cityCode}-${chainId}-${count}`;

    const insert = await db.query(
      `INSERT INTO shipments (
          local_awb, partner_awb, courier_owner,
          pickup_pincode, delivery_pincode, weight, price, user_id,
          sender_name, sender_address, sender_phone, sender_city, sender_state,
          receiver_name, receiver_address, receiver_phone, receiver_city, receiver_state,
          status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          'pending'
        ) RETURNING *`,
      [
        local_awb, partner_awb || null, finalCourierOwner || null,
        pickup_pincode, delivery_pincode, parseFloat(weight), parseFloat(price), user_id,
        sender_name, sender_address || null, sender_phone || null, req.body.sender_city || null, req.body.sender_state || null,
        receiver_name, receiver_address || null, receiver_phone || null, req.body.receiver_city || null, req.body.receiver_state || null
      ]
    );

    res.status(201).json({ shipment: insert.rows[0] });
  } catch (err) {
    console.error("Shipment creation error:", err);
    res.status(500).json({ error: "Failed to create shipment: " + err.message });
  }
});

// Get shipments for the logged-in customer
router.get("/mine", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      "SELECT * FROM shipments WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json({ shipments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
});

// Get all shipments (role-based access)
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query = "SELECT * FROM shipments ORDER BY created_at DESC";
    let params = [];

    // Admin sees ALL shipments
    if (req.user.role === "admin") {
      // Keep default query - show all shipments
    } else if (req.user.role === "courier_admin") {
      // Handle City OR State admins + Explicitly assigned shipments
      const courierOwner = req.user.courier_owner;
      const locationName = courierOwner.replace(/ Courier$/i, "").trim();

      query = `
            SELECT * FROM shipments 
            WHERE 
                LOWER(courier_owner) = LOWER($1) OR
                LOWER(receiver_city) = LOWER($2) OR 
                LOWER(sender_city) = LOWER($2) OR
                LOWER(receiver_state) = LOWER($2) OR 
                LOWER(sender_state) = LOWER($2)
            ORDER BY created_at DESC
        `;
      params = [courierOwner, locationName];
    } else if (req.user.role === "customer") {
      query = "SELECT * FROM shipments WHERE user_id = $1 ORDER BY created_at DESC";
      params = [req.user.id];
    } else if (req.user.role === "employee") {
      // Employees see shipments assigned to them OR booked by them
      query = "SELECT * FROM shipments WHERE assigned_to = $1 OR user_id = $1 ORDER BY created_at DESC";
      params = [req.user.id];
    } else {
      // Default for other roles - show only their shipments
      query = "SELECT * FROM shipments WHERE user_id = $1 ORDER BY created_at DESC";
      params = [req.user.id];
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Get shipments error:", err);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
});

// Razorpay Order Creation
router.post("/create-order", authenticateToken, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

  try {
    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Razorpay Error:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// Get pricing options (for booking page) - MOVED BEFORE :awb route
router.get("/pricing", (req, res) => {
  const { pickup, delivery, weight } = req.query;
  const baseWeight = parseFloat(weight || 1);
  let distanceMultiplier = 1;

  if (pickup && delivery && pickup.length >= 2 && delivery.length >= 2) {
    if (pickup === delivery) {
      distanceMultiplier = 1.2; // Same pincode/local
    } else if (pickup.substring(0, 2) === delivery.substring(0, 2)) {
      distanceMultiplier = 2.5; // Same state zone
    } else if (pickup.charAt(0) === delivery.charAt(0)) {
      distanceMultiplier = 4.0; // Same region
    } else {
      distanceMultiplier = 8.0; // Interstate or very far
    }
  }

  // Generate a micro-distance factor so even 1 digit change in pincode alters the price linearly
  const hashStr = (str) => {
    let h = 0;
    for (let i = 0; i < (str || "").length; i++) h += str.charCodeAt(i);
    return h;
  };
  
  // Create a noticeable spread based on exact pincode values (adds 0-150 Rs)
  const exactLocationFactor = ((hashStr(pickup) + hashStr(delivery)) % 150);
  
  // Base cost per kg is much steeper now to clearly see the weight effect
  const basePrice = (baseWeight * 45 * distanceMultiplier) + exactLocationFactor;

  const prices = [
    { courier: "Delhivery", price: Math.round(basePrice + 14) },
    { courier: "Mahavir", price: Math.round(basePrice - 5) },
    { courier: "Amazon", price: Math.round(basePrice + 22) },
    { courier: "Xpressbees", price: Math.round(basePrice + 8) }
  ];

  res.json({ options: prices });
});

// Get a single shipment by local AWB
router.get("/:awb", async (req, res) => {
  const { awb } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM shipments WHERE local_awb = $1",
      [awb]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res.json({ shipment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// ================= Employee APIs =================

// Get available shipments (not assigned)
router.get("/available", authMiddleware(["employee"]), async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM shipments WHERE status = 'pending' AND assigned_to IS NULL"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch available shipments" });
  }
});

// Accept a shipment
router.post("/:id/accept", authMiddleware(["employee"]), async (req, res) => {
  const shipmentId = req.params.id;
  const userId = req.user.id;

  try {
    const check = await db.query(
      "SELECT * FROM shipments WHERE id=$1 AND assigned_to IS NULL",
      [shipmentId]
    );

    if (check.rows.length === 0) {
      return res.status(400).json({ error: "Shipment already assigned" });
    }

    await db.query(
      "UPDATE shipments SET assigned_to=$1, status='accepted' WHERE id=$2",
      [userId, shipmentId]
    );

    res.json({ success: true, message: "Shipment accepted!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept shipment" });
  }
});

// Update shipment status
router.patch("/:identifier/status", authenticateToken, async (req, res) => {
  const { identifier } = req.params;
  const { status } = req.body;
  const { id: userId, role, courier_owner } = req.user;

  try {
    // Determine if identifying by ID or AWB
    const isId = !isNaN(identifier);
    let checkQuery = isId ? "SELECT * FROM shipments WHERE id = $1" : "SELECT * FROM shipments WHERE local_awb = $1";

    const check = await db.query(checkQuery, [identifier]);

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const shipment = check.rows[0];

    // Authorization Check
    let authorized = false;
    const STATUS_ORDER = {
      'pending': 0, 'accepted': 1, 'picked_up': 2, 'in_transit': 3, 'out_for_delivery': 4, 'delivered': 5
    };

    if (role === 'admin') {
      authorized = true; // Super Admin can change anything
    } else if (role === 'courier_admin') {
      if (shipment.courier_owner?.toLowerCase() === courier_owner?.toLowerCase()) {
        authorized = true; // Courier Admin can change their own shipments
      }
    } else if (role === 'employee') {
      if (shipment.assigned_to === userId) {
        const currentRank = STATUS_ORDER[shipment.status] ?? -1;
        const newRank = STATUS_ORDER[status] ?? -1;
        if (newRank > currentRank) {
          authorized = true; // Employees can only advance the shipment status
        } else {
          return res.status(403).json({ error: "Drivers can only advance the shipment status forward." });
        }
      }
    }

    if (!authorized) {
      return res.status(403).json({ error: "Not authorized to update this shipment" });
    }

    const updateQuery = isId ? "UPDATE shipments SET status = $1 WHERE id = $2 RETURNING *" : "UPDATE shipments SET status = $1 WHERE local_awb = $2 RETURNING *";
    const result = await db.query(updateQuery, [status, identifier]);

    // Send Status Update Email
    if (result.rows.length > 0) {
      const updatedShipment = result.rows[0];
      const userRes = await db.query("SELECT email, name FROM users WHERE id = $1", [updatedShipment.user_id]);
      if (userRes.rows.length > 0) {
        const user = userRes.rows[0];
        const emailText = `Dear ${user.name},\n\nYour shipment with AWB ${updatedShipment.local_awb} status has been updated to: ${status.toUpperCase()}.\n\nThank you for choosing Shipique.`;
        await sendEmail(user.email, `Shipment Status Update: ${updatedShipment.local_awb}`, emailText);
      }
    }

    res.json({ success: true, message: "Status updated!", shipment: result.rows[0] });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ error: "Failed to update status: " + err.message });
  }
});

// Assign Courier Branch (Super Admin only)
router.patch("/:id/assign-courier", authenticateToken, authMiddleware(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { courier_owner } = req.body; // e.g., "Ahmedabad Courier"

  try {
    const result = await db.query(
      "UPDATE shipments SET courier_owner = $1 WHERE id = $2 RETURNING *",
      [courier_owner, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Shipment not found" });

    res.json({ success: true, message: `Shipment assigned to courier: ${courier_owner}`, shipment: result.rows[0] });
  } catch (err) {
    console.error("Assign courier error:", err);
    res.status(500).json({ error: "Failed to assign courier branch" });
  }
});

// Assign Driver (Courier Admin Only)
router.patch("/:id/assign-driver", authenticateToken, authMiddleware(["courier_admin"]), async (req, res) => {
  const { id } = req.params;
  const { driver_id } = req.body; // User ID of the driver

  try {
    // 1. Check if shipment exists
    const shipResult = await db.query("SELECT * FROM shipments WHERE id = $1", [id]);
    if (shipResult.rows.length === 0) return res.status(404).json({ error: "Shipment not found" });
    const shipment = shipResult.rows[0];

    // 2. Permission Check for Courier Admin
    if (req.user.role === 'courier_admin' && shipment.courier_owner !== req.user.courier_owner) {
      return res.status(403).json({ error: "Cannot assign drivers to shipments belonging to another courier branch" });
    }

    // 3. Update
    const result = await db.query(
      "UPDATE shipments SET assigned_to = $1, status = 'assigned' WHERE id = $2 RETURNING *",
      [driver_id, id]
    );

    res.json({ success: true, message: "Driver assigned successfully", shipment: result.rows[0] });
  } catch (err) {
    console.error("Assign driver error:", err);
    res.status(500).json({ error: "Failed to assign driver" });
  }
});

// ================= Courier Admin APIs =================

// Courier admins see only their courier shipments
router.get("/mycourier", authMiddleware(["courier_admin"]), async (req, res) => {
  try {
    const courierName = req.user.courier_owner;
    const { rows } = await db.query(
      "SELECT * FROM shipments WHERE courier_owner=$1",
      [courierName]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch courier shipments" });
  }
});

module.exports = router;
