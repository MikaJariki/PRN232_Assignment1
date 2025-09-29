Backend API for PRN232_Assignment1

How to run (local)
- Prerequisites: .NET SDK 8.0
- Start API: `cd BE/ProductsApi && dotnet run`
- URLs (launchSettings): `http://localhost:5057` and `https://localhost:7057`
- Swagger UI: `http://localhost:5057/swagger`

Project structure
- Controllers: `Controllers/ProductsController.cs`
- Services: `Services/ProductService.cs`
- Repositories: `Repository/EfProductRepository.cs` (Postgres), `Repository/FileProductRepository.cs` (JSON fallback)
- Data model: `Models/Product.cs`
- EF Core DbContext: `Storage/AppDbContext.cs`

Endpoints (JSON camelCase)
- `GET /health` — simple health probe
- `GET /api/products?search=&minPrice=&maxPrice=&page=1&pageSize=9` — list/paged
- `GET /api/products/{id}` — get one
- `POST /api/products` — create `{ name, description, price, image? }`
- `PUT /api/products/{id}` — update partial `{ name?, description?, price?, image? }`
- `DELETE /api/products/{id}` — delete
- Dev only: `POST /api/dev/reset` — wipe and reseed (Development env only)

Notes
- CORS allows FE at `http://localhost:3000` and `https://localhost:3000`.
- If no Postgres connection string is provided, data persists to `BE/ProductsApi/data/products.json`.
- JSON uses camelCase and ISO timestamps. `createdAt`/`updatedAt` are UTC.

Code-first with PostgreSQL
- Local: `appsettings.Development.json` already contains a sample connection string. Update it to your DB.
- Startup runs `Database.Migrate()` and then seeds if empty.
- Migrations included (`Migrations/`): `InitialCreate`.
- To add a new migration:
  - Install EF tools once: `dotnet tool install --global dotnet-ef`
  - Create migration: `dotnet ef migrations add <Name> -p BE/ProductsApi -s BE/ProductsApi`
  - Apply (optional; app also migrates on start): `dotnet ef database update -p BE/ProductsApi -s BE/ProductsApi`

Optional: hook FE to backend
- Create a new client in `FE/lib/api.ts` that calls this API (mirrors functions from `FE/lib/mockApi.ts`).
- Replace imports in components from `./mockApi` to `./api`.
