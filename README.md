# Resort Map

An interactive cabana booking webapp for luxury resorts. Browse a visual resort map, check cabana availability, and book your spot in one step.

---

## Running the App

### Requirements

- Node.js 18+
- npm 9+

### Start (single command)

```bash
./run.sh
```

This builds the React frontend and starts the Express server on **http://localhost:3001**.

Custom map and bookings files:

```bash
./run.sh --map path/to/map.ascii --bookings path/to/bookings.json
```

Defaults to `map.ascii` and `bookings.json` in the working directory.

---

## Running Tests

```bash
npm test
```

npm run test

Runs backend (Jest + supertest) and frontend (Vitest + React Testing Library) tests in sequence.

Backend only:

```bash
npm test --prefix server
```

Frontend only:

```bash
npm test --prefix client
```

---

## Tech Stack

- **Backend:** Node.js + Express, minimist (CLI args)
- **Frontend:** React + Vite
- **Tests:** Jest + supertest (backend), Vitest + React Testing Library (frontend)

---

## Design Decisions & Trade-offs

**Backend is the single source of truth.** The frontend holds no authoritative state — it fetches `/api/map` on load and after each booking. This keeps the UI simple and deterministic; the slight latency of a refetch is imperceptible for a map of this size.

**Map is parsed once at startup.** The ASCII file is read and converted to an immutable grid structure when the server starts. Each `GET /api/map` request overlays the current in-memory booking state on top of that structure. This separates concerns cleanly and avoids redundant parsing.

**Flat API grid shape.** Each cell in the grid contains its full state (`type`, `cabanaId`, `available`). There is no separate cabana index — that would duplicate state and create two sources of truth.

**Booking atomicity.** The availability check and the booking write happen inside a single synchronous function with no async gap. Node.js is single-threaded, so this is sufficient to prevent double-bookings without locks.

**In-memory state.** The spec requires no persistence, so bookings are stored in a `Map` on the server instance. State resets on restart, as intended.

**Express serves the React build.** A single port, no CORS configuration needed. The frontend hits `/api/*` only; it is environment-agnostic.

**Guest validation is case-insensitive with trim.** Avoids trivial booking failures due to capitalisation or leading/trailing whitespace.

**Path tile rendering uses a neighbour bitmask.** Each `#` cell inspects its four cardinal neighbours at render time to select the correct tile variant (straight, corner, split, crossing, or dead-end) and applies the required CSS rotation. The full asset set — `arrowStraight`, `arrowCornerSquare`, `arrowSplit`, `arrowCrossing`, `arrowEnd` — is used.

---