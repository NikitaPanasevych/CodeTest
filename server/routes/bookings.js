const { Router } = require('express');

module.exports = function bookingRoutes(bookingService) {
  const router = Router();

  router.get('/health', (req, res) => res.json({ ok: true }));

  router.post('/bookings', (req, res) => {
    const { cabanaId, room, guestName } = req.body;
    if (!cabanaId || !room || !guestName) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }
    const result = bookingService.bookCabana(cabanaId, room, guestName);
    res.status(result.success ? 200 : 422).json(result);
  });

  return router;
};
