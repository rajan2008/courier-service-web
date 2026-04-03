const db = require('./server/db');
const bcrypt = require('bcrypt');

async function seedUsers() {
    try {
        const hash = await bcrypt.hash('password123', 10);
        
        await db.query(`
            INSERT INTO users (name, email, phone, password, role, courier_owner, is_verified)
            VALUES 
            ('Delhivery Admin', 'admin@delhivery.com', '9999999991', $1, 'courier_admin', 'Delhivery', TRUE),
            ('Rajesh Driver', 'rajesh@delhivery.com', '9999999992', $1, 'employee', 'Delhivery', TRUE),
            ('Rakesh Customer', 'customer@gmail.com', '9999999993', $1, 'customer', NULL, TRUE)
            ON CONFLICT (email) DO NOTHING;
        `, [hash]);

        console.log("Dummy accounts ready!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedUsers();
