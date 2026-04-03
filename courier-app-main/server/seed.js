const db = require('./db');
const bcrypt = require('bcrypt');

async function seedUser() {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        await db.query(`
            INSERT INTO users (name, email, password, role, is_verified) 
            VALUES ('Super Admin', 'rajanprajapati41190@gmail.com', $1, 'admin', TRUE)
            ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
        `, [hash]);
        console.log("Super admin created/updated!");
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
seedUser();
