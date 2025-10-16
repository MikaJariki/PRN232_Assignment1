# PRN232 Assignment 2 – Uma Store

Full-stack e-commerce demo with a Next.js 15 frontend and an ASP.NET Core 8 Web API backend. Assignment 2 extends the original product catalogue with authentication, cart management, and order workflows.

- Frontend: https://prn-232-assignment1-umastore.vercel.app
- Backend: https://prn232-assignment1-h14k.onrender.com (Swagger at /swagger)

## What’s new for Assignment 2
- ? Email/password registration & login backed by JWT bearer tokens
- ? Protected product CRUD endpoints (only authenticated users may create/update/delete)
- ? Persistent cart API (add, update quantity, remove, clear)
- ? Checkout flow that records orders and allows marking them as paid
- ? Updated UI: auth forms, gated product management, cart & checkout screens, order history/detail views
- ? Seeded demo account: demo@uma.store / Password123!

## Tech stack
- **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** ASP.NET Core 8, EF Core 8, JWT authentication, PostgreSQL (Supabase) with in-memory fallback
- **Infra:** Render (API via Docker), Vercel (frontend), Supabase (PostgreSQL)
- **Tooling:** npm, .NET SDK 8, Docker

## Repository layout
`
BE/ProductsApi   # ASP.NET Core Web API (EF Core migrations live here)
FE               # Next.js frontend application
`

## Running locally
### Backend (BE/ProductsApi)
1. Configure ppsettings.Development.json:
   `json
   {
     "ConnectionStrings": {
       "Default": "Host=localhost;Port=5432;Database=uma_store;Username=postgres;Password=postgres"
     },
     "Jwt": {
       "Secret": "local-dev-secret-change-me",
       "Issuer": "UmaStore",
       "Audience": "UmaStoreClient"
     }
   }
   `
   If no connection string is provided the API falls back to an in-memory database (handy for quick demos).
2. Apply migrations & run:
   `ash
   dotnet ef database update
   dotnet run
   `

### Frontend (FE)
1. Copy the example env file: cp .env.local.example .env.local and set NEXT_PUBLIC_API_BASE_URL if the API is not running on http://localhost:5057.
2. Install & start:
   `ash
   npm install
   npm run dev
   `

Use the seeded demo@uma.store account or register your own credentials via the UI.

## API highlights
- POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- GET /api/products (public), POST/PUT/DELETE /api/products/{id} (requires JWT)
- GET/POST/PUT/DELETE /api/cart
- POST /api/orders (checkout), GET /api/orders, GET /api/orders/{id}, POST /api/orders/{id}/pay

Enjoy building on Uma Store! ??
