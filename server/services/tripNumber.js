const { query } = require('../db/database');

async function generateTripNumber() {
  const year = new Date().getFullYear();
  const result = await query(
    `SELECT trip_number FROM trips WHERE trip_number LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`AMB-${year}-%`]
  );
  let seq = 1;
  if (result.rows.length > 0) {
    const last = result.rows[0].trip_number;
    const parts = last.split('-');
    seq = parseInt(parts[2]) + 1;
  }
  return `AMB-${year}-${String(seq).padStart(3, '0')}`;
}

module.exports = { generateTripNumber };
