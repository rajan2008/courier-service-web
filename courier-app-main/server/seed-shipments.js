const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function seedShipments() {
    try {
        // Get a customer ID to associate shipments with
        const customerRes = await pool.query("SELECT id FROM users WHERE role = 'customer' LIMIT 1");
        if (customerRes.rows.length === 0) {
            console.error("Please run seed-users.js first to create a customer.");
            return;
        }
        const customerId = customerRes.rows[0].id;

        const shipments = [
            {
                awb: 'MC-DEL-1001-1',
                sender: 'John Doe',
                receiver: 'Alice Smith',
                r_city: 'Delhi',
                r_state: 'Delhi',
                weight: 1.5,
                price: 150,
                status: 'pending'
            },
            {
                awb: 'MC-MUM-1002-1',
                sender: 'Bob Johnson',
                receiver: 'Charlie Brown',
                r_city: 'Mumbai',
                r_state: 'Maharashtra',
                weight: 2.0,
                price: 200,
                status: 'pending'
            },
            {
                awb: 'MC-BLR-1003-1',
                sender: 'David Wilson',
                receiver: 'Eve Davis',
                r_city: 'Bangalore',
                r_state: 'Karnataka',
                weight: 0.8,
                price: 100,
                status: 'pending'
            },
            {
                awb: 'MC-AHM-1004-1',
                sender: 'Frank Miller',
                receiver: 'Grace Lee',
                r_city: 'Ahmedabad',
                r_state: 'Gujarat',
                weight: 3.2,
                price: 350,
                status: 'pending'
            },
            {
                awb: 'MC-HYD-1005-1',
                sender: 'Harry Potter',
                receiver: 'Imogen Heap',
                r_city: 'Hyderabad',
                r_state: 'Telangana',
                weight: 1.2,
                price: 180,
                status: 'pending'
            },
            {
                awb: 'MC-CHE-1006-1',
                sender: 'Jack Black',
                receiver: 'Kelly White',
                r_city: 'Chennai',
                r_state: 'Tamil Nadu',
                weight: 2.5,
                price: 250,
                status: 'pending'
            }
        ];

        for (const s of shipments) {
            const query = `
        INSERT INTO shipments (
          local_awb, sender_name, receiver_name, receiver_city, receiver_state, 
          weight, price, status, user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (local_awb) DO NOTHING;
      `;
            await pool.query(query, [s.awb, s.sender, s.receiver, s.r_city, s.r_state, s.weight, s.price, s.status, customerId]);
            console.log(`Shipment created: ${s.awb}`);
        }

        console.log('Shipment seeding completed! 📦');
    } catch (err) {
        console.error('Error seeding shipments:', err);
    } finally {
        await pool.end();
    }
}

seedShipments();
