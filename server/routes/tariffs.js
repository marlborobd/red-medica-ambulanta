const router = require('express').Router();
const { query } = require('../db/database');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM tariffs ORDER BY valid_from DESC LIMIT 1');
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { price_per_km, surcharge_urgenta, surcharge_nocturna, surcharge_aparatura } = req.body;
    const result = await query(
      `INSERT INTO tariffs (price_per_km, surcharge_urgenta, surcharge_nocturna, surcharge_aparatura, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [price_per_km, surcharge_urgenta, surcharge_nocturna, surcharge_aparatura, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
