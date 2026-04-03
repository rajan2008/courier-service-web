const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function initDb() {
    const dbUrl = process.env.DATABASE_URL;
    const dbName = dbUrl.split('/').pop().split('?')[0];
    const baseUrl = dbUrl.replace(`/${dbName}`, '/postgres');

    const client = new Client({ connectionString: baseUrl });

    try {
        await client.connect();

        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
        if (res.rowCount === 0) {
            console.log(`Creating database ${dbName}...`);
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database ${dbName} created!`);
        } else {
            console.log(`Database ${dbName} already exists.`);
        }
        await client.end();

        // Now connect to the actual database and run setup.sql
        const db = require('./db');
        const sqlPath = path.join(__dirname, '..', 'setup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing setup.sql...');
        await db.query(sql);
        console.log('Database initialized successfully! 🟢');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        try { await client.end(); } catch (e) { }
        process.exit(1);
    }
}

initDb();
