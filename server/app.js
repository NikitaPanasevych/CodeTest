const express = require('express');
const path = require('path');
const { parseMap } = require('./mapParser');
const { createBookingService } = require('./services/bookingService');
const mapRoutes = require('./routes/map');
const bookingRoutes = require('./routes/bookings');

function createApp({ mapPath, bookingsPath }) {
  const grid = parseMap(mapPath);
  const bookingService = createBookingService(bookingsPath);

  const app = express();
  app.use(express.json());
  app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

  app.use('/api', mapRoutes(grid, bookingService));
  app.use('/api', bookingRoutes(bookingService));

  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));

  return app;
}

module.exports = { createApp };
