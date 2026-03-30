const path = require('path');
const minimist = require('minimist');
const { createApp } = require('./app');

const argv = minimist(process.argv.slice(2));
const mapPath = path.resolve(argv.map || 'map.ascii');
const bookingsPath = path.resolve(argv.bookings || 'bookings.json');

const app = createApp({ mapPath, bookingsPath });

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Resort Map server running on http://localhost:${PORT}`);
    console.log(`  Map:      ${mapPath}`);
    console.log(`  Bookings: ${bookingsPath}`);
  });
}

module.exports = app;
