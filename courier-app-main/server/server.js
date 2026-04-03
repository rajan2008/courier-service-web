require('dotenv').config();         // Load env vars FIRST
const express = require('express'); // Import express
const cors = require('cors');       // Import CORS
const shipmentRoutes = require('./routes/shipmentRoutes');
const authRoutes = require('./routes/authRoutes');

const db = require('./db');

db.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('DB connection failed', err);
  } else {
    console.log('DB connected 🟢', result.rows[0]);
  }
});
const app = express();
app.use(cors());

// Razorpay Webhook requires raw body parsing
app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'fallback_webhook_secret';
    
    // Verify Webhook Signature
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(req.body);
    const digest = shasum.digest('hex');
    
    if (digest === req.headers['x-razorpay-signature']) {
        console.log('Razorpay Webhook Request verified.');
        // Optionally parse body to fetch payload details here.
        // const payload = JSON.parse(req.body);
        res.status(200).json({ status: 'ok' });
    } else {
        res.status(400).json({ error: 'Invalid signature' });
    }
});

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/api/shipments', shipmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.message);
  const status = err.status || 500;
  const message = err.message || 'Something went wrong!';
  res.status(status).json({ error: message });
});

app.get("/", (req, res) => {
  res.send("Courier backend is running 🏃‍♂️💨");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
