const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { query } = require('../db/database');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, requireRole('admin', 'dispecer'), async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, phone, license_number, vehicle_plate, is_active, created_at FROM users ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/drivers', auth, async (req, res) => {
  try {
    const result = await query(
      "SELECT id, name, vehicle_plate, license_number FROM users WHERE role = 'sofer' AND is_active = true ORDER BY name"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone, license_number, vehicle_plate } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, license_number, vehicle_plate)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, name, email, role, phone, license_number, vehicle_plate, is_active, created_at`,
      [name, email, hash, role || 'sofer', phone, license_number, vehicle_plate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, role, phone, license_number, vehicle_plate, is_active } = req.body;
    const result = await query(
      `UPDATE users SET name=$1, email=$2, role=$3, phone=$4, license_number=$5, vehicle_plate=$6, is_active=$7
       WHERE id=$8 RETURNING id, name, email, role, phone, license_number, vehicle_plate, is_active`,
      [name, email, role, phone, license_number, vehicle_plate, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
