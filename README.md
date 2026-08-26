# MoveIn 🏠
> **Redefining Student Housing in Pune. Built for Trust, Safety, and Proximity.**

MoveIn is a premium student housing platform designed to bridge the gap between students and verified premium stays. Launching first in Pune, it features a proprietary **Proximity Engine**, a **25-Point Safety Audit**, and a **Cinematic UX** that makes finding a home as easy as booking a hotel.

---

## ✨ Key Features

### 📍 Proximity Engine
Our intelligent location engine finds stays within walking distance of your college hub (COEP, MIT-WPU, Symbiosis, etc.). It calculates precise walking distances and travel times to ensure you never have to commute. Optimized for Pune's student hubs.

### 🛡️ Safety First Protocol
Every property on MoveIn undergoes a rigorous **25-Point Safety Audit**. We look beyond the furniture to verify structural safety, emergency exits, neighborhood lighting, and 24/7 security presence.

### 🎯 Gender-Specific Hubs
Filter stays by **Boys Hub**, **Girls Hub**, or **Co-Living** spaces. Each listing is tagged with gender preferences to ensure you find the community that fits you best.

### 🗺️ Interactive Exploration
A high-performance map interface powered by **Leaflet**, allowing students to explore the neighborhood, local amenities, and campus proximity in real-time.

---

## 🛠️ Tech Stack

**Frontend:**
- **Next.js 16 (Turbopack)** - Server-side rendering and high performance.
- **Tailwind CSS** - Modern, responsive styling.
- **Framer Motion** - Cinematic animations and transitions.
- **Leaflet.js** - Interactive map engine.

**Backend:**
- **Next.js Route Handlers** - API served from the same app at `/api`, no separate service.
- **PostgreSQL** - Single source of truth, via `node-postgres`.
- **Layered architecture** - Models → Repositories → Services → Route Handlers (`frontend/src/server/`).
- **JWT** - Secure, stateless authentication.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v20+)
- PostgreSQL (local instance, or any hosted Postgres)

### 2. Installation
```bash
git clone https://github.com/Rkx-01/MoveIn.git
cd MoveIn/frontend
npm install
```

### 3. Environment Setup
Create `frontend/.env.local`:
```env
DATABASE_URL=postgresql://user@localhost:5432/movein_dev
JWT_SECRET=your_secret_key
SEED_SECRET=any_random_string
```
`NEXT_PUBLIC_API_URL` is **not** required — the UI calls the same origin at `/api`.
Set it only to point the UI at a different host.

### 4. Database Seeding
The schema is created automatically on first request. To populate Pune stays:
```bash
createdb movein_dev
npm run seed          # demo stock: 5 generated stays per college
npm run import:stays  # real stays pulled from OpenStreetMap
```

`npm run seed` is **demo data** — plausible but invented, and flagged as verified
so the audited-listing UI has something to show. `npm run import:stays` is the
real thing: it queries OpenStreetMap's Overpass API around every college and
imports the hostels, PGs and dormitories that actually exist there.

Imported listings are deliberately incomplete, because OSM carries only what it
carries:

| Field | Real | Notes |
| --- | --- | --- |
| Name, coordinates, address | ✅ | Straight from OSM |
| Phone, website | sometimes | Only when the mapper recorded it |
| Gender preference | inferred | Read off the name ("Boys Hostel", "Girls PG") |
| Rent | ❌ estimated | A locality band, labelled as indicative in the description |
| Photos, availability | ❌ absent | No image is invented; the card shows a placeholder |
| Safety score | ❌ none | No 25-point audit has run, so no score is shown |

They are stored with `is_verified = false` and surface in the UI as
**Unverified / Audit Pending**. Treat them as leads to go verify, not as
bookable inventory. Data is © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright).

The properties API also backfills the same source lazily: filtering by a college
triggers a post-response sync for that hub, cached for 24h.

To run on real listings only, skip the demo stock:
```bash
npm run seed -- --no-demo-properties
npm run import:stays
```

### 5. Run Locally
```bash
npm run dev   # http://localhost:3000 — app and API together
```

---

## 🌐 Deployment

The app deploys to **Vercel as a single project** (root directory: `frontend`). The
API ships with it as Next.js Route Handlers, so there is no second service to
wire up and no cross-origin configuration.

### 1. Provision a Postgres database
Any managed Postgres works (Neon, Supabase, Vercel Postgres). Use the **pooled**
connection string — serverless functions open many short-lived connections.

### 2. Set environment variables in the Vercel project
| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Pooled Postgres connection string |
| `JWT_SECRET` | yes | Any long random string |
| `SEED_SECRET` | to seed | Gates `POST /api/admin/seed`; seeding is disabled without it |
| `GOOGLE_PLACES_API_KEY` | no | Richer listings (ratings). Falls back to OpenStreetMap, which needs no key |

### 3. Deploy, then seed once
```bash
curl -X POST https://<your-app>.vercel.app/api/admin/seed \
  -H "x-seed-secret: <SEED_SECRET>"
```
This is destructive — it truncates and rebuilds the dataset, so run it on a fresh
database only. Add `?demo=false` to skip the invented demo stays. Real listings
then arrive on their own, as students filter by college.

### API surface
| Route | Method | Auth |
| --- | --- | --- |
| `/api/properties` | GET | public |
| `/api/properties` | POST | Host |
| `/api/properties/:id` | GET | public |
| `/api/colleges`, `/api/colleges/:id` | GET | public |
| `/api/cities`, `/api/cities/:id` | GET | public |
| `/api/auth/register`, `/api/auth/login` | POST | public |
| `/api/bookings` | POST | Tenant |
| `/api/bookings/my-bookings` | GET | Tenant |
| `/api/admin/seed` | POST | `x-seed-secret` |

---

## 📸 Preview
*Coming Soon: Explore the cinematic interface of MoveIn.*

---

## 📄 License
This project is licensed under the ISC License.

---
Built with ❤️ by [Rkx-01](https://github.com/Rkx-01)