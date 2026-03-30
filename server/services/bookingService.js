const fs = require('fs');

function createBookingService(bookingsFilePath) {
	const guests = JSON.parse(fs.readFileSync(bookingsFilePath, 'utf8'));
	const bookings = new Map();

	function normalize(str) {
		return String(str).trim().toLowerCase();
	}

	function validateGuest(room, guestName) {
		return guests.some(
			(g) => normalize(g.room) === normalize(room) && normalize(g.guestName) === normalize(guestName)
		);
	}

	function bookCabana(cabanaId, room, guestName) {
		if (bookings.has(cabanaId)) {
			return { success: false, error: 'Cabana already booked' };
		}
		if (!validateGuest(room, guestName)) {
			return { success: false, error: 'Guest not found' };
		}
		bookings.set(cabanaId, { room, guestName });
		return { success: true };
	}

	function buildMapResponse(grid) {
		return grid.map((row) =>
			row.map((cell) => {
				if (cell.type !== 'W') return { ...cell, available: null };
				return { ...cell, available: !bookings.has(cell.cabanaId) };
			})
		);
	}

	return { bookCabana, buildMapResponse };
}

module.exports = { createBookingService };
