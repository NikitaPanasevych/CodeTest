# Resort Map — Frontend

React + Vite client for the Resort Map cabana booking app.

## Stack

- **React 19** + **Vite 5**
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin)
- **Vitest** + **React Testing Library** for tests

## Structure

```
src/
├── components/
│   ├── ResortMap.jsx      # Page root — fetches grid, renders map
│   ├── MapTile.jsx        # Single grid cell (cabana, pool, path, etc.)
│   ├── BookingModal.jsx   # Cabana booking form + status states
│   ├── Backdrop.jsx       # Full-screen modal overlay (React portal)
│   └── Dialog.jsx         # Modal content card
├── constants/
│   └── cellTypes.js       # CELL_TYPES enum shared across components
├── utils/
│   └── pathTiles.js       # Neighbour bitmask → path tile image + rotation
├── api.js                 # fetchMap / postBooking fetch wrappers
└── index.css              # Global styles + Tailwind import + resort theme
```

## Development

```bash
npm install
npm run dev        # starts Vite dev server on :5173 (proxies /api → :3001)
```

Requires the backend running on port 3001. From the repo root: `./run.sh`.

## Tests

```bash
npm test           # vitest run (single pass)
```

## Key decisions

**Path tiles use a neighbour bitmask.** `getPathTileConfig(grid, r, c)` checks N/S/E/W neighbours and returns the correct asset (`arrowStraight`, `arrowCornerSquare`, `arrowSplit`, `arrowCrossing`, `arrowEnd`) with a CSS rotation angle. No extra data is needed from the server.

**Modal uses a React portal.** `Backdrop` renders via `createPortal` into `document.body` to guarantee full-viewport coverage regardless of any CSS stacking context on parent elements.

**Backend is the source of truth.** After a successful booking the client refetches `/api/map` rather than mutating local state.
