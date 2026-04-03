const db = require('./db');

async function runMigrations() {
    try {
        console.log("Running migrations...");

        await db.query(`
            CREATE TABLE IF NOT EXISTS cached_pincodes (
                pincode VARCHAR(10) PRIMARY KEY,
                city VARCHAR(100),
                state VARCHAR(100),
                lat NUMERIC(10,6),
                lng NUMERIC(10,6),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Add refresh token
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT;`);

        console.log("Migrations applied successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

runMigrations();
