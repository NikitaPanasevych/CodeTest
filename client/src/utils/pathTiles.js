import { CELL_TYPES } from '../constants/cellTypes';

const isPath = (cell) => cell?.type === CELL_TYPES.PATH;

export function getPathTileConfig(grid, r, c) {
	const N = isPath(grid[r - 1]?.[c]);
	const S = isPath(grid[r + 1]?.[c]);
	const E = isPath(grid[r]?.[c + 1]);
	const W = isPath(grid[r]?.[c - 1]);
	const count = [N, S, E, W].filter(Boolean).length;

	if (count === 4) {
		return { src: '/assets/arrowCrossing.png', rotation: 0 };
	}

	if (count === 3) {
		if (!W) return { src: '/assets/arrowSplit.png', rotation: 0 };
		if (!N) return { src: '/assets/arrowSplit.png', rotation: 90 };
		if (!E) return { src: '/assets/arrowSplit.png', rotation: 180 };
		if (!S) return { src: '/assets/arrowSplit.png', rotation: 270 };
	}

	if (count === 2) {
		if (N && S) return { src: '/assets/arrowStraight.png', rotation: 0 };
		if (E && W) return { src: '/assets/arrowStraight.png', rotation: 90 };
		if (N && E) return { src: '/assets/arrowCornerSquare.png', rotation: 0 };
		if (S && E) return { src: '/assets/arrowCornerSquare.png', rotation: 90 };
		if (S && W) return { src: '/assets/arrowCornerSquare.png', rotation: 180 };
		if (N && W) return { src: '/assets/arrowCornerSquare.png', rotation: 270 };
	}

	if (count === 1) {
		if (N) return { src: '/assets/arrowEnd.png', rotation: 180 };
		if (E) return { src: '/assets/arrowEnd.png', rotation: 270 };
		if (S) return { src: '/assets/arrowEnd.png', rotation: 0 };
		if (W) return { src: '/assets/arrowEnd.png', rotation: 90 };
	}

	return { src: '/assets/arrowEnd.png', rotation: 0 };
}
