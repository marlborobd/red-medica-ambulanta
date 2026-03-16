const router = require('express').Router();
const { query } = require('../db/database');
const { auth, requireRole } = require('../middleware/auth');
const { generateTripNumber } = require('../services/tripNumber');

const driverFilter = (req) =>
  req.user.role === 'sofer' ? 'AND t.driver_id = ' + req.user.id : '';

router.get('/', auth, async (req, res) => {
  try {
    const { status, driver_id, from, to, search, page = 1, limit = 20 } = req.query;
    let conditions = ['1=1'];
    const params = [];
    let pi = 1;

    if (req.user.role === 'sofer') {
      conditions.push(`t.driver_id = $${pi++}`);
      params.push(req.user.id);
    } else if (driver_id) {
      conditions.push(`t.driver_id = $${pi++}`);
      params.push(driver_id);
    }
    if (status) { conditions.push(`t.status = $${pi++}`); params.push(status); }
    if (from) { conditions.push(`t.scheduled_at >= $${pi++}`); params.push(from); }
    if (to) { conditions.push(`t.scheduled_at <= $${pi++}`); params.push(to); }
    if (search) { conditions.push(`t.patient_name ILIKE $${pi++}`); params.push(`%${search}%`); }

    const offset = (page - 1) * limit;
    const where = conditions.join(' AND ');
    const result = await query(
      `SELECT t.*, u.name as driver_name FROM trips t LEFT JOIN users u ON t.driver_id = u.id
       WHERE ${where} ORDER BY t.scheduled_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    const count = await query(`SELECT COUNT(*) FROM trips t WHERE ${where}`, params);
    res.json({ trips: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/calendar', auth, async (req, res) => {
  try {
    const week = req.query.week || new Date().toISOString().split('T')[0];
    const start = new Date(week);
    const day = start.getDay();
    const mon = new Date(start);
    mon.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    sun.setHours(23, 59, 59);

    let cond = req.user.role === 'sofer' ? 'AND t.driver_id = $3' : '';
    const params = [mon.toISOString(), sun.toISOString()];
    if (req.user.role === 'sofer') params.push(req.user.id);

    const result = await query(
      `SELECT t.*, u.name as driver_name FROM trips t LEFT JOIN users u ON t.driver_id = u.id
       WHERE t.scheduled_at BETWEEN $1 AND $2 ${cond} ORDER BY t.scheduled_at`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let cond = req.user.role === 'sofer' ? 'AND t.driver_id = $3' : '';
    const params = [today.toISOString(), tomorrow.toISOString()];
    if (req.user.role === 'sofer') params.push(req.user.id);

    const result = await query(
      `SELECT t.*, u.name as driver_name FROM trips t LEFT JOIN users u ON t.driver_id = u.id
       WHERE t.scheduled_at BETWEEN $1 AND $2 ${cond} ORDER BY t.scheduled_at`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    let driverCond = req.user.role === 'sofer' ? 'AND driver_id = $3' : '';
    const params = [monthStart.toISOString(), monthEnd.toISOString()];
    if (req.user.role === 'sofer') params.push(req.user.id);

    const result = await query(
      `SELECT COUNT(*) as total_trips, COALESCE(SUM(distance_km),0) as total_km,
              COALESCE(SUM(total_cost),0) as total_revenue
       FROM trips WHERE scheduled_at BETWEEN $1 AND $2 AND status != 'anulata' ${driverCond}`,
      params
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todayParams = [today.toISOString(), tomorrow.toISOString()];
    if (req.user.role === 'sofer') todayParams.push(req.user.id);
    const todayResult = await query(
      `SELECT COUNT(*) as today_trips FROM trips WHERE scheduled_at BETWEEN $1 AND $2 ${driverCond}`,
      todayParams
    );

    const planned = await query(
      `SELECT COUNT(*) as planned FROM trips WHERE status = 'planificata' ${req.user.role === 'sofer' ? 'AND driver_id = $1' : ''}`,
      req.user.role === 'sofer' ? [req.user.id] : []
    );

    res.json({
      ...result.rows[0],
      today_trips: todayResult.rows[0].today_trips,
      planned_trips: planned.rows[0].planned,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await query(
      `SELECT t.*, u.name as driver_name, u.license_number as driver_license, u.vehicle_plate as driver_vehicle
       FROM trips t LEFT JOIN users u ON t.driver_id = u.id WHERE t.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const trip = result.rows[0];
    if (req.user.role === 'sofer' && trip.driver_id !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const trip_number = await generateTripNumber();
    const {
      patient_name, patient_age, patient_cnp, patient_phone, diagnosis,
      pickup_address, destination_address, pickup_lat, pickup_lng,
      destination_lat, destination_lng, distance_km, duration_min,
      scheduled_at, trip_type, price_per_km, surcharge_pct, total_cost,
      driver_id, notes
    } = req.body;

    const result = await query(
      `INSERT INTO trips (trip_number, patient_name, patient_age, patient_cnp, patient_phone, diagnosis,
        pickup_address, destination_address, pickup_lat, pickup_lng, destination_lat, destination_lng,
        distance_km, duration_min, scheduled_at, trip_type, price_per_km, surcharge_pct, total_cost,
        driver_id, assigned_by, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       RETURNING *`,
      [trip_number, patient_name, patient_age, patient_cnp, patient_phone, diagnosis,
       pickup_address, destination_address, pickup_lat, pickup_lng, destination_lat, destination_lng,
       distance_km, duration_min, scheduled_at, trip_type || 'standard', price_per_km, surcharge_pct || 0,
       total_cost, driver_id, req.user.id, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await query('SELECT * FROM trips WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const trip = existing.rows[0];
    if (req.user.role === 'sofer' && trip.driver_id !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    const {
      patient_name, patient_age, patient_cnp, patient_phone, diagnosis,
      pickup_address, destination_address, distance_km, duration_min,
      scheduled_at, trip_type, price_per_km, surcharge_pct, total_cost,
      driver_id, notes, status
    } = req.body;

    const result = await query(
      `UPDATE trips SET patient_name=$1, patient_age=$2, patient_cnp=$3, patient_phone=$4, diagnosis=$5,
        pickup_address=$6, destination_address=$7, distance_km=$8, duration_min=$9, scheduled_at=$10,
        trip_type=$11, price_per_km=$12, surcharge_pct=$13, total_cost=$14, driver_id=$15,
        notes=$16, status=$17, updated_at=NOW()
       WHERE id=$18 RETURNING *`,
      [patient_name, patient_age, patient_cnp, patient_phone, diagnosis,
       pickup_address, destination_address, distance_km, duration_min, scheduled_at,
       trip_type, price_per_km, surcharge_pct, total_cost, driver_id,
       notes, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const existing = await query('SELECT * FROM trips WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const trip = existing.rows[0];
    if (req.user.role === 'sofer' && trip.driver_id !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    let extra = '';
    if (status === 'in_desfasurare') extra = ', started_at = NOW()';
    if (status === 'finalizata') extra = ', completed_at = NOW()';

    const result = await query(
      `UPDATE trips SET status=$1, updated_at=NOW() ${extra} WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const result = await query('DELETE FROM trips WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
