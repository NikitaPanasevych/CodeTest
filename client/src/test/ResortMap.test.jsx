import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, beforeEach, afterEach, test, expect } from 'vitest';
import ResortMap from '../components/ResortMap';
import * as api from '../api';

const mockGrid = [
	[
		{ type: '.', cabanaId: null, available: null },
		{ type: 'W', cabanaId: '0-1', available: true },
		{ type: 'W', cabanaId: '0-2', available: false },
		{ type: 'p', cabanaId: null, available: null },
		{ type: 'c', cabanaId: null, available: null },
		{ type: '#', cabanaId: null, available: null },
	],
];

beforeEach(() => {
	vi.spyOn(api, 'fetchMap').mockResolvedValue({ grid: mockGrid });
	vi.spyOn(api, 'postBooking').mockResolvedValue({ success: true });
});

afterEach(() => vi.restoreAllMocks());

test('renders the map grid after loading', async () => {
	render(<ResortMap />);
	await waitFor(() => expect(screen.getByTestId('map-grid')).toBeInTheDocument());
});

test('shows loading state initially', () => {
	render(<ResortMap />);
	expect(screen.getByText(/loading map/i)).toBeInTheDocument();
});

test('renders cabana tiles for W cells', async () => {
	render(<ResortMap />);
	await waitFor(() => screen.getByTestId('map-grid'));
	const imgs = screen.getAllByAltText('W');
	expect(imgs.length).toBe(2);
});

test('clicking an available cabana opens booking modal', async () => {
	render(<ResortMap />);
	await waitFor(() => screen.getByTestId('map-grid'));
	const cabanaTiles = screen.getAllByTitle('Available');
	fireEvent.click(cabanaTiles[0]);
	expect(screen.getByText(/Book Cabana/i)).toBeInTheDocument();
});

test('clicking a booked cabana shows unavailable message', async () => {
	render(<ResortMap />);
	await waitFor(() => screen.getByTestId('map-grid'));
	const bookedTile = screen.getByTitle('Booked');
	fireEvent.click(bookedTile);
	expect(screen.getByText(/Cabana Unavailable/i)).toBeInTheDocument();
});

test('successful booking shows confirmation and refetches map', async () => {
	render(<ResortMap />);
	await waitFor(() => screen.getByTestId('map-grid'));

	fireEvent.click(screen.getByTitle('Available'));
	fireEvent.change(screen.getByPlaceholderText(/101/), { target: { value: '101' } });
	fireEvent.change(screen.getByPlaceholderText(/Alice Smith/), { target: { value: 'Alice Smith' } });
	fireEvent.click(screen.getByText('Confirm Booking'));

	await waitFor(() => expect(screen.getByText(/Booking Confirmed/i)).toBeInTheDocument());
	expect(api.fetchMap).toHaveBeenCalledTimes(2); // initial load + refetch
});

test('failed booking shows error message', async () => {
	vi.spyOn(api, 'postBooking').mockResolvedValue({ success: false, error: 'Guest not found' });

	render(<ResortMap />);
	await waitFor(() => screen.getByTestId('map-grid'));

	fireEvent.click(screen.getByTitle('Available'));
	fireEvent.change(screen.getByPlaceholderText(/101/), { target: { value: '999' } });
	fireEvent.change(screen.getByPlaceholderText(/Alice Smith/), { target: { value: 'Nobody' } });
	fireEvent.click(screen.getByText('Confirm Booking'));

	await waitFor(() => expect(screen.getByText('Guest not found')).toBeInTheDocument());
});

test('shows error message when the map fetch rejects (API/network failure)', async () => {
	vi.spyOn(api, 'fetchMap').mockRejectedValue(new Error('Network error'));
	render(<ResortMap />);
	await waitFor(() =>
		expect(screen.getByText(/Failed to load resort map/i)).toBeInTheDocument()
	);
});

test('clicking Cancel closes the booking modal without submitting', async () => {
	render(<ResortMap />);
	await waitFor(() => screen.getByTestId('map-grid'));

	fireEvent.click(screen.getByTitle('Available'));
	expect(screen.getByText(/Book Cabana/i)).toBeInTheDocument();

	fireEvent.click(screen.getByText('Cancel'));
	expect(screen.queryByText(/Book Cabana/i)).not.toBeInTheDocument();
	expect(api.postBooking).not.toHaveBeenCalled();
});

test('previously booked cabana shows as Booked after map refetch on confirmation', async () => {
	// Second fetchMap returns the same cabana flipped to available:false
	const bookedGrid = mockGrid.map(row =>
		row.map(cell => (cell.cabanaId === '0-1' ? { ...cell, available: false } : cell))
	);
	vi.spyOn(api, 'fetchMap')
		.mockResolvedValueOnce({ grid: mockGrid })
		.mockResolvedValueOnce({ grid: bookedGrid });

	render(<ResortMap />);
	await waitFor(() => screen.getByTestId('map-grid'));

	fireEvent.click(screen.getByTitle('Available'));
	fireEvent.change(screen.getByPlaceholderText(/101/), { target: { value: '101' } });
	fireEvent.change(screen.getByPlaceholderText(/Alice Smith/), { target: { value: 'Alice Smith' } });
	fireEvent.click(screen.getByText('Confirm Booking'));

	await waitFor(() => screen.getByText(/Booking Confirmed/i));
	fireEvent.click(screen.getByText('Back to Map'));

	// Both cabana tiles should now carry title="Booked"
	await waitFor(() => expect(screen.getAllByTitle('Booked').length).toBe(2));
});
