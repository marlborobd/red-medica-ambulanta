const router = require('express').Router();
const { query } = require('../db/database');
const { auth } = require('../middleware/auth');
const { generateTripPDF } = require('../services/pdfService');

router.post('/trip/:id', auth, async (req, res) => {
  try {
    const result = await query(
      `SELECT t.*, u.name as driver_name, u.license_number, u.vehicle_plate
       FROM trips t LEFT JOIN users u ON t.driver_id = u.id WHERE t.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
    const trip = result.rows[0];
    const driver = {
      name: trip.driver_name,
      license_number: trip.license_number,
      vehicle_plate: trip.vehicle_plate,
    };
    const pdfBuffer = await generateTripPDF(trip, driver);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="foaie-parcurs-${trip.trip_number}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
