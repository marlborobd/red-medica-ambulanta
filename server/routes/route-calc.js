const router = require('express').Router();
const axios = require('axios');
const { auth } = require('../middleware/auth');

router.post('/calculate', auth, async (req, res) => {
  try {
    const { origin, destination } = req.body;
    const apiKey = process.env.GOOGLE_ROUTES_API_KEY;

    if (apiKey) {
      const response = await axios.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          origin: { address: origin },
          destination: { address: destination },
          travelMode: 'DRIVE',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
          },
        }
      );
      const route = response.data.routes[0];
      return res.json({
        distance_km: parseFloat((route.distanceMeters / 1000).toFixed(2)),
        duration_min: Math.round(parseInt(route.duration) / 60),
      });
    }

    // Mock fallback
    res.json({ distance_km: 8.5, duration_min: 22 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
