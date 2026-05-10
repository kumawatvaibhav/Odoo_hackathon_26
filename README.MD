
# Traveloop — Multi-City Trip Planner

Traveloop is a full-stack travel planning platform built during Odoo Hackathon-26. It enables users to design, budget, and manage multi-city itineraries with collaborative features, activity suggestions, and expense tracking.

---

## Features

- **User Authentication**: Secure signup/login with JWT, password hashing, and session management.
- **Trip Management**: Create, edit, and delete trips with title, description, dates, and total budget.
- **Itinerary Builder**: Add multiple stops (cities) to a trip, each with its own date range, notes, and budget allocation.
- **Day-by-Day Activities**: For each stop, add daily activities with descriptions and expenses, visualized in a timeline view.
- **Budget Tracking**: Visual budget tracker for total, allocated, and remaining funds per trip and per stop.
- **Expense Management**: Track expenses by category, day, and stop; see totals and breakdowns.
- **Community & Collaboration**: (Planned) Share trips, invite collaborators, and discover public itineraries.
- **Responsive UI**: Modern, mobile-friendly interface using Tailwind CSS and React.

---

## Tech Stack

- **Frontend**: React (with TanStack Router), Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (with advanced schema, enums, and constraints)
- **ORM/DB Layer**: Raw SQL via `pg`
- **Auth**: JWT, bcrypt

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/           # Database connection
│   │   ├── middleware/       # Auth, rate limiting, validation
│   │   ├── modules/
│   │   │   ├── auth/         # Auth logic, routes, types
│   │   │   ├── trips/        # Trip, stop, activity logic
│   │   │   └── ...
│   │   └── utils/            # Error handling, response helpers
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (site, ui)
│   │   ├── lib/              # API clients, context, utils
│   │   ├── routes/           # App pages (itinerary, my-trips, plan-trip, etc)
│   │   └── hooks/            # Custom React hooks
│   ├── package.json
│   └── tsconfig.json
├── database/
│   ├── 001_users.sql         # Users table
│   ├── 002_cities.sql        # Cities catalog
│   ├── 003_trips.sql         # Trips table
│   ├── 004_trip_stops.sql    # Trip stops (itinerary sections)
│   ├── 005_activities.sql    # Activities catalog
│   ├── 019_trip_activities.sql # Day-by-day activities per stop
│   ├── 007_expenses.sql      # Expense tracking
│   ├── 018_seed_data.sql     # Demo data
│   └── migrate.sql           # Master migration script
└── README.md
```

---

## Key Files & Folders

- **backend/src/modules/trips/**: All trip, stop, and activity logic (controllers, services, types, routes)
- **frontend/src/routes/itinerary.$tripId.tsx**: Main itinerary view, including day-by-day activity and budget UI
- **frontend/src/lib/trips-api.ts**: API client for trips, stops, activities
- **database/004_trip_stops.sql**: Schema for itinerary sections (stops)
- **database/019_trip_activities.sql**: Schema for per-day activities

---

## Setup & Development

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL (v14+ recommended)

### 1. Database
1. Create a PostgreSQL database (default: `traveloop`).
2. Run all SQL files in `database/` in order, or use `migrate.sql` for a full setup.
3. (Optional) Run `018_seed_data.sql` for demo cities/activities, and `020_seed_demo.sql` for a demo user/trip.

### 2. Backend
```
cd backend
cp .env.example .env   # Set DB credentials
npm install
npm run dev
```

### 3. Frontend
```
cd frontend
cp .env.example .env   # Set API URL if needed
npm install
npm run dev
```

---

## Usage

- Register or log in (demo: demo@traveloop.com / Password123!)
- Create a new trip, add stops (cities), and build your itinerary day by day.
- Track your budget and expenses for each stop and activity.
- View all your trips, filter by status, and revisit any itinerary.

---

## Contributing

PRs and issues welcome! Please open an issue for bugs or feature requests.

---

## License

MIT License. See LICENSE file for details.

