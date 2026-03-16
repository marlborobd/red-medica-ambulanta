const router = require('express').Router();
const { query } = require('../db/database');
const { auth, requireRole } = require('../middleware/auth');

router.get('/monthly', auth, async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, mon] = month.split('-');
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0, 23, 59, 59);

    const result = await query(
      `SELECT COUNT(*) as total_trips, COALESCE(SUM(distance_km),0) as total_km,
              COALESCE(SUM(total_cost),0) as total_revenue
       FROM trips WHERE scheduled_at BETWEEN $1 AND $2 AND status = 'finalizata'`,
      [start.toISOString(), end.toISOString()]
    );
    const trips = await query(
      `SELECT t.*, u.name as driver_name FROM trips t LEFT JOIN users u ON t.driver_id = u.id
       WHERE t.scheduled_at BETWEEN $1 AND $2 AND t.status = 'finalizata' ORDER BY t.scheduled_at`,
      [start.toISOString(), end.toISOString()]
    );
    res.json({ stats: result.rows[0], trips: trips.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/driver/:id', auth, async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, mon] = month.split('-');
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0, 23, 59, 59);

    const result = await query(
      `SELECT COUNT(*) as total_trips, COALESCE(SUM(distance_km),0) as total_km,
              COALESCE(SUM(total_cost),0) as total_revenue
       FROM trips WHERE driver_id = $1 AND scheduled_at BETWEEN $2 AND $3 AND status = 'finalizata'`,
      [req.params.id, start.toISOString(), end.toISOString()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
