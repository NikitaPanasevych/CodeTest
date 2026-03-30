const path = require('path');
const request = require('supertest');
const { createApp } = require('../app');

const MAP_PATH = path.join(__dirname, '..', '..', 'map.ascii');
const BOOKINGS_PATH = path.join(__dirname, '..', '..', 'bookings.json');

let app;
beforeEach(() => {
	app = createApp({ mapPath: MAP_PATH, bookingsPath: BOOKINGS_PATH });
});

describe('GET /api/health', () => {
	test('returns ok', async () => {
		const res = await request(app).get('/api/health');
		expect(res.status).toBe(200);
		expect(res.body.ok).toBe(true);
	});
});

describe('GET /api/map', () => {
	test('returns a grid array', async () => {
		const res = await request(app).get('/api/map');
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.grid)).toBe(true);
	});

	test('grid rows are arrays', async () => {
		const res = await request(app).get('/api/map');
		res.body.grid.forEach((row) => expect(Array.isArray(row)).toBe(true));
	});

	test('cabana cells have available field', async () => {
		const res = await request(app).get('/api/map');
		const cabanaCells = res.body.grid.flat().filter((c) => c.type === 'W');
		expect(cabanaCells.length).toBeGreaterThan(0);
		cabanaCells.forEach((c) => {
			expect(typeof c.available).toBe('boolean');
		});
	});
});

describe('POST /api/bookings', () => {
	test('succeeds with valid guest and available cabana', async () => {
		const mapRes = await request(app).get('/api/map');
		const cabana = mapRes.body.grid.flat().find((c) => c.type === 'W' && c.available);
		expect(cabana).toBeDefined();

		const res = await request(app).post('/api/bookings').send({
			cabanaId: cabana.cabanaId,
			room: '101',
			guestName: 'Alice Smith',
		});
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
	});

	test('fails with invalid guest', async () => {
		const res = await request(app).post('/api/bookings').send({
			cabanaId: '99-99',
			room: '999',
			guestName: 'Nobody',
		});
		expect(res.status).toBe(422);
		expect(res.body.success).toBe(false);
		expect(res.body.error).toBe('Guest not found');
	});

	test('fails when missing fields', async () => {
		const res = await request(app).post('/api/bookings').send({ cabanaId: '11-3' });
		expect(res.status).toBe(400);
		expect(res.body.success).toBe(false);
	});

	test('returns 400 when fields are present but empty strings', async () => {
		const res = await request(app).post('/api/bookings').send({
			cabanaId: '',
			room: '',
			guestName: '',
		});
		expect(res.status).toBe(400);
		expect(res.body.success).toBe(false);
	});

	test('returns 422 with Cabana already booked when booking the same cabana twice', async () => {
		const mapRes = await request(app).get('/api/map');
		const cabana = mapRes.body.grid.flat().find((c) => c.type === 'W' && c.available);
		expect(cabana).toBeDefined();

		await request(app).post('/api/bookings').send({
			cabanaId: cabana.cabanaId,
			room: '101',
			guestName: 'Alice Smith',
		});

		const res = await request(app).post('/api/bookings').send({
			cabanaId: cabana.cabanaId,
			room: '102',
			guestName: 'Bob Jones',
		});
		expect(res.status).toBe(422);
		expect(res.body.success).toBe(false);
		expect(res.body.error).toBe('Cabana already booked');
	});
});

describe('Booking state reflected in map (POST -> GET round-trip)', () => {
	test('booked cabana shows available:false on subsequent GET /api/map', async () => {
		const mapRes1 = await request(app).get('/api/map');
		const cabana = mapRes1.body.grid.flat().find((c) => c.type === 'W' && c.available);
		expect(cabana).toBeDefined();

		const bookRes = await request(app).post('/api/bookings').send({
			cabanaId: cabana.cabanaId,
			room: '101',
			guestName: 'Alice Smith',
		});
		expect(bookRes.status).toBe(200);

		const mapRes2 = await request(app).get('/api/map');
		const updatedCell = mapRes2.body.grid.flat().find((c) => c.cabanaId === cabana.cabanaId);
		expect(updatedCell.available).toBe(false);
	});
});
