# PRN232 Assignment 2 – Uma Store

Full-stack e-commerce demo with a Next.js 15 frontend and an ASP.NET Core 8 Web API backend. Assignment 2 extends the original catalogue with authentication, cart/order management, and optional Stripe Checkout payments.

- Frontend: https://prn-232-assignment1-umastore.vercel.app
- Backend: https://prn232-assignment1-h14k.onrender.com (Swagger at /swagger)

## What’s new for Assignment 2
- ✅ Email/password registration & login backed by JWT bearer tokens
- ✅ Protected product CRUD endpoints (only authenticated users may create/update/delete)
- ✅ Persistent cart API (add, update quantity, remove, clear)
- ✅ Checkout flow that records orders and supports marking as paid
- ✅ Stripe Checkout integration: server-side session creation + webhook to confirm payment
- ✅ Updated UI: auth forms, gated product management, cart & checkout screens, order history/detail views
- ✅ Seeded demo account: demo@umastore.co / umastore

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



Enjoy shopping on Uma Store! 🚀
