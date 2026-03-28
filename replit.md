# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── fruit-store/        # React + Vite fruit store frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
│   └── src/seed.ts         # Database seeder
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Fruit Store App (Фруктовый Магазин)

Full-stack Russian-language fruit e-commerce site for Russian customers.

### Features
- Full Russian UI — all text in Russian
- Product catalog with filtering (category, price, organic, search)
- Shopping cart with localStorage persistence
- JWT authentication (register/login)
- Order creation and order history
- Admin panel for product and order management
- Responsive design (mobile/tablet/desktop)

### Test Accounts
- **Admin**: `admin@fruitstore.ru` / `admin123`
- **Customer**: `ivan@example.ru` / `customer123`

### Pages
- `/` — Home (hero, featured fruits, categories)
- `/shop` — Catalog with filters
- `/product/:slug` — Product detail
- `/cart` — Shopping cart
- `/checkout` — Checkout (requires login)
- `/my-orders` — Order history (requires login)
- `/login` — Login
- `/register` — Register
- `/admin` — Admin panel (admin only)

### API Endpoints
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Current user
- `GET /api/fruits` — Fruit list (filter: category, price, organic, search)
- `GET /api/fruits/:slug` — Fruit detail
- `POST /api/fruits` — Create fruit (Admin)
- `PUT /api/fruits/:id` — Update fruit (Admin)
- `DELETE /api/fruits/:id` — Delete fruit (Admin)
- `POST /api/orders` — Create order (Auth required)
- `GET /api/orders/my` — My orders (Auth required)
- `PATCH /api/orders/:id/status` — Update status (Admin)

### DB Schema
- `users` — with roles (CUSTOMER/ADMIN)
- `fruits` — with categories (МЕСТНЫЕ/ТРОПИЧЕСКИЕ/ОРГАНИЧЕСКИЕ/ИМПОРТНЫЕ)
- `orders` — with statuses (ОЖИДАНИЕ/ПОДТВЕРЖДЁН/ОТПРАВЛЕН/ДОСТАВЛЕН/ОТМЕНЁН)
- `order_items` — order line items

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/scripts run seed` — seed the database with sample data

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes in `src/routes/`: auth, fruits, orders.
Middleware in `src/middlewares/auth.ts` for JWT auth.
Depends on: `@workspace/db`, `@workspace/api-zod`, `jsonwebtoken`, `bcryptjs`

### `artifacts/fruit-store` (`@workspace/fruit-store`)

React + Vite frontend for the fruit store. Russian-language UI.
Uses React Query hooks from `@workspace/api-client-react`.
Key hooks: `use-auth.tsx` (JWT auth context), `use-cart.tsx` (cart context).

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.
Schema: `users.ts`, `fruits.ts`, `orders.ts`

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI spec and Orval codegen config.
Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks from the OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts including database seeder.
