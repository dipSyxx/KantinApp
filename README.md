# KantinApp — Hamar Katedralskole

A canteen menu and voting app for students and kitchen staff at Hamar Katedralskole.

**Students** browse daily/weekly menus, view dish details (allergens, ingredients), and vote on meals.
**Kitchen staff** manage dishes, publish weekly menus, track popularity, and adjust portions based on demand.

## Architecture

| Layer    | Stack                                  | Directory   |
| -------- | -------------------------------------- | ----------- |
| Backend  | Next.js 15 (App Router) + Prisma + Neon | `backend/`  |
| Frontend | Expo (React Native) + expo-router + NativeWind | `frontend/` |

## Getting Started

### Prerequisites

- Node.js >= 20
- npm or yarn
- A Neon PostgreSQL database (or any Postgres for local dev)

### Backend

```bash
cd backend
npm install
cp .env.example .env        # fill in DATABASE_URL and DIRECT_URL
npx prisma migrate dev      # run migrations
npx prisma db seed          # seed test data
npm run dev                 # starts on http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npx expo start              # starts Expo dev server
```

Set `EXPO_PUBLIC_API_URL` in `frontend/.env` to your backend URL (e.g. `http://<your-ip>:3000`).

## Project Structure

```
KantinApp/
├── backend/
│   ├── prisma/              # Schema, migrations, seed
│   └── src/
│       ├── app/
│       │   ├── api/         # REST API routes
│       │   └── admin/       # Admin UI (Next.js pages)
│       ├── lib/             # Shared utilities (db, auth, validation)
│       └── services/        # Business logic
└── frontend/
    ├── app/                 # expo-router screens
    └── src/
        ├── api/             # API client + React Query hooks
        ├── components/      # Reusable UI components
        ├── lib/             # Utilities
        └── constants/       # Colors, allergens, config
```

## Key Features

- Weekly menu browsing with day grouping (Mandag–Fredag)
- Dish detail view with allergen badges
- 3-level voting system (bad / ok / great) with real-time stats
- Admin dashboard for menu management and analytics
- JWT authentication with role-based access (Student / Canteen Admin)
- Optimistic UI updates for voting

## License

Private — Hamar Katedralskole
