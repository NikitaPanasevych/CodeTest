const fs = require('fs');

function parseMap(filePath) {
	const text = fs.readFileSync(filePath, 'utf8');
	const lines = text.split('\n').filter((line) => line.length > 0);

	const grid = lines.map((line, row) =>
		line.split('').map((char, col) => {
			const type = char === 'W' ? 'W' : char === 'p' ? 'p' : char === '#' ? '#' : char === 'c' ? 'c' : '.';
			return {
				type,
				cabanaId: type === 'W' ? `${row}-${col}` : null,
			};
		})
	);

	return grid;
}

module.exports = { parseMap };
