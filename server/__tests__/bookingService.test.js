const path = require('path');
const { createBookingService } = require('../services/bookingService');

const BOOKINGS_PATH = path.join(__dirname, '..', '..', 'bookings.json');

let service;
beforeEach(() => {
	service = createBookingService(BOOKINGS_PATH);
});

describe('bookCabana', () => {
	test('succeeds with a valid guest and available cabana', () => {
		const result = service.bookCabana('11-3', '101', 'Alice Smith');
		expect(result).toEqual({ success: true });
	});

	test('fails when the guest is not found', () => {
		const result = service.bookCabana('11-4', '101', 'Wrong Name');
		expect(result.success).toBe(false);
		expect(result.error).toBe('Guest not found');
	});

	test('fails on double-booking the same cabana', () => {
		service.bookCabana('11-5', '101', 'Alice Smith');
		const result = service.bookCabana('11-5', '102', 'Bob Jones');
		expect(result.success).toBe(false);
		expect(result.error).toBe('Cabana already booked');
	});

	test('guest validation is case-insensitive', () => {
		const result = service.bookCabana('11-6', '101', 'alice smith');
		expect(result.success).toBe(true);
	});

	test('guest validation trims whitespace', () => {
		const result = service.bookCabana('11-7', ' 101 ', '  Alice Smith  ');
		expect(result.success).toBe(true);
	});

	test('succeeds for a valid guest even when cabanaId is not in the parsed map', () => {
		const result = service.bookCabana('999-999', '101', 'Alice Smith');
		expect(result.success).toBe(true);
	});
});

describe('buildMapResponse', () => {
	const mockGrid = [
		[
			{ type: '.', cabanaId: null },
			{ type: 'W', cabanaId: '0-1' },
			{ type: 'p', cabanaId: null },
		],
	];

	test('adds available:null to non-W cells', () => {
		const result = service.buildMapResponse(mockGrid);
		expect(result[0][0].available).toBeNull();
		expect(result[0][2].available).toBeNull();
	});

	test('marks unbooked cabana as available', () => {
		const result = service.buildMapResponse(mockGrid);
		expect(result[0][1].available).toBe(true);
	});

	test('marks booked cabana as unavailable', () => {
		service.bookCabana('0-1', '101', 'Alice Smith');
		const result = service.buildMapResponse(mockGrid);
		expect(result[0][1].available).toBe(false);
	});
});
