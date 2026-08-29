# Sol & Stone

California luxury real estate — demo build of the site described in
[`docs/spec.md`](docs/spec.md).

A monorepo with three services:

| Folder | Stack | Responsibility |
|---|---|---|
| `frontend/` | Next.js 16 (App Router), Tailwind v4, next-intl | The site, EN + ES |
| `backend-django/` | Django 5 + DRF | Listings, agents, communities, insights, lead inbox, admin |
| `backend-fastapi/` | FastAPI | `/ai/valuation`, `/ai/ticker` |

---

## Running it

```bash
# 1) Django — http://localhost:8000  (admin at /admin/)
cd backend-django
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py createsuperuser        # to log into the admin
python manage.py runserver

# 2) FastAPI — http://localhost:8001  (docs at /docs)
cd backend-fastapi
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# 3) Next.js — http://localhost:3000
cd frontend
npm install
npm run dev
```

Or `docker compose up --build`.

Copy each `.env.example` to `.env` (`.env.local` for the frontend) before
deploying. No API keys are invented anywhere in this repo — Mapbox and FRED
values come from the owner's own accounts, and the site works without them.

---

## What is real and what is mocked

The demo is for a client pitch, so **every feature is clickable end to end**,
but some back ends are deliberately simple (spec §19).

| Feature | Demo | Phase 1+ |
|---|---|---|
| AI valuation | Real endpoint, transparent formula, real numbers | ML / MLS comparables |
| Market ticker | `backend-fastapi/ticker/values.json`, edited weekly | FRED API + MLS |
| 360° tour | Fully walkable; panoramas are generated placeholders | Real equirectangular photography |
| Lead forms | Written to the database, visible in the admin | + SendGrid / Twilio notifications |
| Listing photos | Branded CSS gradient placeholders | Uploads via the admin |
| Map | Self-contained vector basemap of the LA basin | Mapbox GL JS |
| Database | SQLite | PostgreSQL (+PostGIS) via `DATABASE_URL` |
| Auth / saved search | Not built | Phase 2 |

### Imagery

There is no licensed photography yet, so every image field in the seed data is
blank and `frontend/components/MediaFrame.tsx` paints a deterministic gradient
with the subject's name. **Nothing needs to change in the code when real photos
arrive** — add a URL or upload a file on any image field in the Django admin and
that component renders the photo instead.

### Map

`frontend/components/MapView.tsx` draws its own coastline, freeways, place
labels and price markers from `frontend/lib/geo.ts`, projected with Web
Mercator. It pans, zooms and stays in sync with the results list. Replacing it
with Mapbox GL JS in Phase 1 is a single-component swap — the props are the seam.

---

## Data flow

The frontend calls the Django REST API first and falls back to
`frontend/lib/demo-data.json` — a snapshot of the same seed data — if the API is
unreachable. That keeps `next build` and the deployed demo rendering when only
the frontend is running. Regenerate the snapshot after changing seed data:

```bash
cd backend-django && python manage.py dump_demo_json
```

## API

```
GET  /api/properties/?city=&price_min=&price_max=&beds=&baths=&type=&listing_type=&community=&agent=
GET  /api/properties/{slug}/
GET  /api/agents/            GET /api/agents/{slug}/
GET  /api/communities/       GET /api/communities/{slug}/
GET  /api/insights/          GET /api/insights/{slug}/
POST /api/leads/                     # throttled + honeypot

POST /ai/valuation                   # { sqft, zone, condition, lot_size?, property_type?, year_built? }
GET  /ai/valuation/zones             # options the Sell chat offers
GET  /ai/ticker
```

## Notes

- `npm run build` pins webpack (`next build --webpack`): the Turbopack
  production build in Next 16.3.3 references a shared client chunk it never
  emits, which breaks hydration. `next dev` still uses Turbopack.
- All listings, agents, addresses and statistics are fictional (spec §14).
