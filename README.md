# Flight Booking India — Backend

Node.js + Express + MongoDB REST API for an Indian domestic flight booking platform. Prices are in INR, and the seed data covers 15 major Indian airports and 6 domestic airlines.

## Tech stack
- Node.js + Express
- MongoDB + Mongoose
- JWT auth with bcrypt password hashing

## Project structure
```
config/      MongoDB connection
models/      User, Flight, Booking schemas
controllers/ Route handlers
routes/      Express routers
middleware/  Auth guard, error handler
seed/        Sample Indian flight/airport data + seed script
```

## Local setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   - `MONGO_URI` — a local MongoDB instance or a free MongoDB Atlas cluster
   - `JWT_SECRET` — any long random string
   - `CLIENT_URL` — your frontend's URL (`http://localhost:5173` for local dev)
   - `ROLLING_WINDOW_DAYS` — how many days ahead flights stay available (default 30)
3. Seed the database once, to create the demo accounts and the initial flight window:
   ```bash
   npm run seed
   ```
   This creates two demo accounts:
   - `admin@flightbooking.in` / `admin123` (role: admin)
   - `demo@flightbooking.in` / `demo1234` (role: user)
4. Start the dev server:
   ```bash
   npm run dev
   ```
   The API runs on `http://localhost:5000` by default.

## Flight data never goes stale — no repeated reseeding

`npm run seed` is a **one-time bootstrap**, not something you need to re-run on a schedule. From then on, the running server keeps a rolling window of `ROLLING_WINDOW_DAYS` days of flights available on its own:

- On every server start, it checks which of the next N days already have flights generated (tracked in the `GeneratedFlightDate` collection) and fills in any gaps.
- While running, a daily job (`services/flightScheduler.js`, via `node-cron`) extends the window by one more day.
- The startup check is what makes this safe on free hosting tiers that spin down when idle (like Render's free plan): whenever the app wakes up — even after being asleep for a week — it immediately catches up on any days it missed, instead of relying solely on the cron firing at an exact time.
- Past flights are never deleted, so booking history and PNR lookups keep working; they simply stop showing up in search results once their date has passed (the search query already filters by date).

If you ever want to force a check on demand (e.g. right after deploying) without waiting for the next boot or the 3am job, call:
```
POST /api/admin/flights/generate
```
(admin JWT required — it's a no-op if the window is already full, so it's safe to call anytime.)

## API overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in, returns a JWT |
| GET | `/api/auth/me` | User | Current user profile |
| GET | `/api/flights` | Public | Search flights (`?origin=DEL&destination=BOM&date=2026-10-12&travelClass=Economy&sort=price`) |
| GET | `/api/flights/airports/all` | Public | List all airports in the system |
| GET | `/api/flights/:id` | Public | Flight details |
| POST | `/api/flights` | Admin | Create a flight |
| PUT | `/api/flights/:id` | Admin | Update a flight |
| DELETE | `/api/flights/:id` | Admin | Delete a flight |
| POST | `/api/bookings` | User | Book a flight |
| GET | `/api/bookings/mine` | User | Your bookings |
| GET | `/api/bookings/:id` | User/Admin | Booking details |
| PUT | `/api/bookings/:id/cancel` | User | Cancel a booking |
| GET | `/api/admin/stats/summary` | Admin | Dashboard header counts |
| GET | `/api/admin/stats/bookings-over-time` | Admin | Daily bookings & revenue (for charts) |
| GET | `/api/admin/stats/bookings-by-airline` | Admin | Bookings grouped by airline (for charts) |
| GET | `/api/admin/stats/popular-routes` | Admin | Top routes by booking count (for charts) |

## Deploying to Render

1. Push this folder to a GitHub repo named `project-name-backend` (per your assignment's naming convention).
2. On [render.com](https://render.com), create a new **Web Service** and connect that repo.
3. Set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. Add environment variables in Render's dashboard (Settings → Environment): `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your deployed Netlify URL).
5. Use a MongoDB Atlas connection string for `MONGO_URI` — Render doesn't host MongoDB itself. Atlas has a free tier (M0) that works fine for this.
6. After the first deploy, run the seed script once from your local machine pointed at the Atlas `MONGO_URI` (or via Render's shell) so the production database has flight data.
7. Note your Render service URL (e.g. `https://your-app.onrender.com`) — you'll set this as the API base URL in the frontend's environment variables.
