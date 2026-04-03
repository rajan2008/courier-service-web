const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function seedUsers() {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const users = [
        {
            name: 'Test Customer',
            email: 'customer@example.com',
            phone: '1234567890',
            password: hashedPassword,
            role: 'customer',
            is_verified: true
        },
        {
            name: 'Test Driver',
            email: 'driver@example.com',
            phone: '1234567891',
            password: hashedPassword,
            role: 'employee',
            is_verified: true
        },
        {
            name: 'Test Courier Admin',
            email: 'courier@example.com',
            phone: '1234567892',
            password: hashedPassword,
            role: 'courier_admin',
            is_verified: true,
            courier_owner: 'Test Courier Ltd'
        },
        {
            name: 'Super Admin',
            email: 'admin@example.com',
            phone: '1234567893',
            password: hashedPassword,
            role: 'admin',
            is_verified: true
        }
    ];

    try {
        for (const user of users) {
            const query = `
        INSERT INTO users (name, email, phone, password, role, is_verified, courier_owner)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE 
        SET name = EXCLUDED.name, role = EXCLUDED.role, password = EXCLUDED.password
        RETURNING id, email, role;
      `;
            const values = [user.name, user.email, user.phone, user.password, user.role, user.is_verified, user.courier_owner || null];
            const res = await pool.query(query, values);
            console.log(`User created/updated: ${res.rows[0].email} (Role: ${res.rows[0].role})`);
        }
        console.log('Seeding completed successfully! 🚀');
    } catch (err) {
        console.error('Error seeding users:', err);
    } finally {
        await pool.end();
    }
}

seedUsers();
