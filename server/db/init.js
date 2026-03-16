require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
// also try server/.env
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('./database');

async function init() {
  console.log('Initializing database...');

  const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
  await pool.query(sql);
  console.log('Tables created (if not exist)');

  // Admin user
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@ambulanta.ro']);
  if (existing.rows.length === 0) {
    const hash = await bcrypt.hash('Admin123!', 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)`,
      ['Administrator', 'admin@ambulanta.ro', hash, 'admin']
    );
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  // Default tariff
  const tariff = await pool.query('SELECT id FROM tariffs LIMIT 1');
  if (tariff.rows.length === 0) {
    await pool.query(
      `INSERT INTO tariffs (price_per_km, surcharge_urgenta, surcharge_nocturna, surcharge_aparatura)
       VALUES (5.00, 30.00, 20.00, 50.00)`
    );
    console.log('Default tariff created');
  } else {
    console.log('Tariff already exists');
  }

  console.log('Database initialization complete');
  process.exit(0);
}

init().catch((err) => {
  console.error('Init error:', err);
  process.exit(1);
});
