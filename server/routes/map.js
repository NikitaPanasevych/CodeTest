const { Router } = require('express');

module.exports = function mapRoutes(grid, bookingService) {
  const router = Router();

  router.get('/map', (req, res) => {
    res.json({ grid: bookingService.buildMapResponse(grid) });
  });

  return router;
};
