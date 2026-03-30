import { useEffect, useState } from 'react';
import { fetchMap } from '../api';
import { CELL_TYPES } from '../constants/cellTypes';
import { getPathTileConfig } from '../utils/pathTiles';
import MapTile from './MapTile';
import BookingModal from './BookingModal';

export default function ResortMap() {
	const [grid, setGrid] = useState(null);
	const [error, setError] = useState('');
	const [selectedCabana, setSelectedCabana] = useState(null);

	useEffect(() => {
		let cancelled = false;
		fetchMap()
			.then((data) => {
				if (!cancelled) setGrid(data.grid);
			})
			.catch(() => {
				if (!cancelled) setError('Failed to load resort map.');
			});
		return () => {
			cancelled = true;
		};
	}, []);

	async function handleBooked() {
		try {
			const data = await fetchMap();
			setGrid(data.grid);
		} catch {
			setError('Failed to load resort map.');
		}
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="border border-red-200 bg-red-50 text-red-700 rounded-sm px-6 py-4 text-sm font-[var(--font-body)]">
					{error}
				</div>
			</div>
		);
	}

	if (!grid) {
		return (
			<div className="flex items-center justify-center min-h-screen gap-1.5">
				<span className="sr-only">Loading map…</span>
				{[0, 1, 2].map((i) => (
					<span
						key={i}
						className="w-2 h-2 rounded-full bg-[#c8921a] animate-bounce"
						style={{ animationDelay: `${i * 0.13}s` }}
						aria-hidden="true"
					/>
				))}
			</div>
		);
	}

	const cols = grid[0]?.length ?? 0;

	return (
		<div className="flex flex-col items-center px-6 py-12 animate-resort-enter">
			<header className="text-center mb-8">
				<p className="text-[11px] tracking-[0.35em] uppercase text-[#8b6914] font-medium mb-3">
					✦ &nbsp; Palmera Resort &nbsp; ✦
				</p>
				<h1>Resort Map</h1>
				<p className="mt-2 text-[#8b6914]/80 italic font-[var(--font-display)] text-base">
					Select a cabana to make your reservation
				</p>
				<div className="mt-5 h-px bg-gradient-to-r from-transparent via-[#d4a843] to-transparent" />
			</header>

			<div className="flex gap-6 mb-6 text-[11px] tracking-[0.2em] uppercase font-medium text-[#5c3410]">
				<span className="flex items-center gap-2">
					<span className="w-3 h-3 rounded-[2px] bg-green-500/50 ring-1 ring-green-700/30 inline-block" />
					Available
				</span>
				<span className="flex items-center gap-2">
					<span className="w-3 h-3 rounded-[2px] bg-red-500/55 ring-1 ring-red-700/30 inline-block" />
					Booked
				</span>
			</div>

			<div className="map-grid-enter p-2 rounded-sm bg-[#8b6914]/20 shadow-[0_2px_0_rgba(255,255,255,0.6)_inset,0_16px_48px_rgba(61,31,13,0.25)]">
				<div
					data-testid="map-grid"
					className="grid gap-px border-2 border-[#8b6914]/60 p-1 rounded-[2px]"
					style={{
						gridTemplateColumns: `repeat(${cols}, 36px)`,
						backgroundImage: 'url(/assets/parchmentBasic.png)',
						backgroundSize: 'cover',
					}}
				>
					{grid.map((row, r) =>
						row.map((cell, c) => (
							<MapTile
								key={`${r}-${c}`}
								cell={cell}
								pathConfig={cell.type === CELL_TYPES.PATH ? getPathTileConfig(grid, r, c) : null}
								onClick={() => setSelectedCabana(cell)}
							/>
						))
					)}
				</div>
			</div>

			{selectedCabana && (
				<BookingModal cabana={selectedCabana} onClose={() => setSelectedCabana(null)} onBooked={handleBooked} />
			)}
		</div>
	);
}
