# MoveIn – Production-Grade Student Housing Platform (India)

MoveIn is a specialized discovery and booking platform designed for students across India. It focuses on safety, verification, and precise proximity to 50+ major educational institutions.

## Core Value Proposition
- **Real-World Institutional Hubs**: Integrated coordinates for all 23 IITs, 31 NITs, AIIMS, and NLUs.
- **Production-Lite Backend**: PostgreSQL-powered query engine with SQL-level Haversine distance calculations for sub-second geo-sorting.
- **Verified Safety**: 3-tier on-ground verification system with safety scores (8.5–9.9).
- **Student Essentials**: Native support for Indian student must-haves: RO Water, Power Backup, and Meal Plans.

## Key Technical Features
- **Geospatial Discovery**: Optimized search using SQL-level distance calculations to find housing near specific institutional hubs.
- **Role-Based Polymorphism**: Unified `User` base class with specific behaviors for `Tenant`, `Host`, and `Admin`.
- **Automated Availability**: Strict double-booking prevention logic at the database layer.
- **Simulated Payment Lifecycle**: End-to-end flow with state transitions (PENDING -> CONFIRMED).

## Software Engineering Practices
- **Clean Architecture**: Separation of concerns using **Controllers**, **Services**, and **Repositories**.
- **OOP Principles**: Extensive use of **Inheritance** (User roles), **Encapsulation** (Service-level logic), and **Abstraction** (Repository interfaces).
- **Type Safety**: Full TypeScript implementation across the stack to minimize runtime errors.
- **Data Integrity**: Relational constraints and transactional bookings to ensure consistency.

## Technology Stack
- **Frontend**: Next.js 15+, Tailwind CSS, Framer Motion (Animations).
- **Backend**: Node.js, Express, TypeORM (PostgreSQL/SQLite).
- **Database**: PostgreSQL (Production) / SQLite (Development).

## Production Roadmap
1. **Live Stripe Integration**: Transition from simulated `PaymentService` to real Stripe Webhooks.
2. **PostGIS**: Migrate Haversine logic to native PostGIS for more complex spatial queries (e.g. area polygons).
3. **Host Dashboard**: Implementation of property management and lead tracking for verified hosts.
