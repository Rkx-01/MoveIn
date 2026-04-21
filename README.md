# MoveIn 🏠
> **Redefining Student Housing in Pune. Built for Trust, Safety, and Proximity.**

MoveIn is a premium student housing platform designed to bridge the gap between students and verified premium stays. Launching first in Pune, it features a proprietary **Proximity Engine**, a **25-Point Safety Audit**, and a **Cinematic UX** that makes finding a home as easy as booking a hotel.

---

## ✨ Key Features

### 📍 Proximity Engine
Our intelligent location engine finds stays within walking distance of your college hub (COEP, MIT-WPU, Symbiosis, etc.). It calculates precise walking distances and travel times to ensure you never have to commute.

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
- **Node.js & Express** - Scalable API architecture.
- **TypeORM** - Robust database abstraction.
- **PostgreSQL / SQLite** - Flexible data storage.
- **JWT** - Secure, stateless authentication.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (for production) or SQLite (for local testing)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Rkx-01/MoveIn.git
cd MoveIn

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup
Create a `.env` file in the `backend` directory:
```env
PORT=5001
JWT_SECRET=your_secret_key
DB_TYPE=sqlite # Change to 'postgres' for production
```

### 4. Database Seeding
```bash
cd backend
npm run dev # This will initialize the DB
# Run the seed script to populate Pune properties
npx ts-node src/scripts/seedIndia.ts
```

### 5. Run Locally
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 🌐 Deployment

MoveIn is architected for seamless deployment:
- **Backend**: Optimized for **Render** or **Railway** with support for `DATABASE_URL`.
- **Frontend**: Optimized for **Vercel** with zero-config Next.js support.

Refer to the internal deployment guide for environment variable mapping.

---

## 📸 Preview
*Coming Soon: Explore the cinematic interface of MoveIn.*

---

## 📄 License
This project is licensed under the ISC License.

---
Built with ❤️ by [Rkx-01](https://github.com/Rkx-01)