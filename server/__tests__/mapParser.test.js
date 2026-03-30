const path = require('path');
const os = require('os');
const fs = require('fs');
const { parseMap } = require('../mapParser');

const MAP_PATH = path.join(__dirname, '..', '..', 'map.ascii');

describe('parseMap', () => {
  let grid;

  beforeAll(() => {
    grid = parseMap(MAP_PATH);
  });

  test('returns a 2D array', () => {
    expect(Array.isArray(grid)).toBe(true);
    expect(Array.isArray(grid[0])).toBe(true);
  });

  test('all rows have the same width', () => {
    const width = grid[0].length;
    grid.forEach(row => expect(row.length).toBe(width));
  });

  test('cells have type and cabanaId fields', () => {
    const cell = grid[0][0];
    expect(cell).toHaveProperty('type');
    expect(cell).toHaveProperty('cabanaId');
  });

  test('W cells have a cabanaId in "row-col" format', () => {
    const cabanaCells = grid.flat().filter(c => c.type === 'W');
    expect(cabanaCells.length).toBeGreaterThan(0);
    cabanaCells.forEach(c => {
      expect(c.cabanaId).toMatch(/^\d+-\d+$/);
    });
  });

  test('non-W cells have null cabanaId', () => {
    const nonCabana = grid.flat().filter(c => c.type !== 'W');
    nonCabana.forEach(c => expect(c.cabanaId).toBeNull());
  });

  test('recognises all expected tile types', () => {
    const types = new Set(grid.flat().map(c => c.type));
    expect(types).toContain('W');
    expect(types).toContain('p');
    expect(types).toContain('#');
    expect(types).toContain('c');
    expect(types).toContain('.');
  });
});

describe('parseMap edge cases (inline content)', () => {
  let tmpFile;

  function writeTmp(content) {
    tmpFile = path.join(os.tmpdir(), `mapparser_test_${Date.now()}.ascii`);
    fs.writeFileSync(tmpFile, content, 'utf8');
    return tmpFile;
  }

  afterEach(() => {
    if (tmpFile) {
      try { fs.unlinkSync(tmpFile); } catch {}
      tmpFile = null;
    }
  });

  test('returns empty grid for a file that contains only blank lines', () => {
    const result = parseMap(writeTmp('\n\n\n'));
    expect(result).toEqual([]);
  });

  test('returns grid with no cabana cells when no W characters are present', () => {
    const result = parseMap(writeTmp('...\n.p.\n...'));
    const cabanaCells = result.flat().filter(c => c.type === 'W');
    expect(cabanaCells.length).toBe(0);
    result.flat().forEach(c => expect(c.cabanaId).toBeNull());
  });

  test('rows of different lengths are preserved as-is (no padding)', () => {
    // The parser does not normalise row widths; each row reflects its source line.
    const result = parseMap(writeTmp('...\n.....\n.'));
    expect(result[0].length).toBe(3);
    expect(result[1].length).toBe(5);
    expect(result[2].length).toBe(1);
  });

  test('unknown characters are treated as empty space (dot type)', () => {
    const result = parseMap(writeTmp('?X!'));
    result[0].forEach(c => expect(c.type).toBe('.'));
  });
});
