# Ecom Example

A full-stack e-commerce application built as a portfolio project. Demonstrates modern web development practices with Nuxt 4, a REST API, PostgreSQL, and Feature-Sliced Design architecture.

## Screenshots

| Desktop — Catalog                                                           | Desktop — Cart                                                          |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| ![Catalog](https://i.ibb.co/spVCpCT3/Screenshot-2026-06-22-at-16-59-27.png) | ![Cart](https://i.ibb.co/gsvcZ7m/Screenshot-2026-06-22-at-16-59-59.png) |

| Mobile — Home                                                                   | Mobile — Cart                                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| ![Mobile Home](https://i.ibb.co/dwVY0hvC/Screenshot-2026-06-22-at-17-00-57.png) | ![Mobile Cart](https://i.ibb.co/yBKs9p9z/Screenshot-2026-06-22-at-17-01-20.png) |

## Tech Stack

**Frontend**

- [Nuxt 4](https://nuxt.com) — Vue 3 full-stack framework with file-based routing
- [Pinia](https://pinia.vuejs.org) — state management
- SCSS — design system with variables, mixins, and typography

**Backend**

- Nitro — Nuxt's built-in server engine for API routes
- [Prisma](https://www.prisma.io) — ORM with PostgreSQL driver adapter
- [Zod](https://zod.dev) — runtime validation on all API endpoints

**Infrastructure**

- Docker + Docker Compose — containerized dev and production environments
- PostgreSQL 18

**Tooling**

- TypeScript (strict mode)
- ESLint + Prettier + Stylelint
- Vitest — unit tests
- Husky + lint-staged — pre-commit hooks

## Data Model

| Model                 | Description                               |
| --------------------- | ----------------------------------------- |
| `User`                | Customers and admins                      |
| `Category`            | Two-level tree (parent → children)        |
| `Product`             | Belongs to a category, supports discounts |
| `Order` + `OrderItem` | Customer orders with line items           |
| `CartItem`            | Persistent cart, unique per user+product  |
| `Article`             | Blog/editorial content                    |

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com) and Docker Compose
- [Node.js](https://nodejs.org) 22+
- [pnpm](https://pnpm.io) 10+

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/MarkGareev/ecom-example.git
cd ecom-example
pnpm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Start the database and dev server:

```bash
make dev
```

4. Run migrations and seed the database:

```bash
make migrate
make seed
```

The app will be available at `http://localhost:3000`.

### Without Docker

```bash
pnpm dev
```

Requires a running PostgreSQL instance. Set `DATABASE_URL` in `.env` accordingly.

## Available Commands

### Development

```bash
make dev          # start dev environment (Docker)
make dev-down     # stop dev environment
make dev-logs     # stream app logs
```

### Database

```bash
make migrate      # run pending migrations
make seed         # seed the database with sample data
make studio       # open Prisma Studio
```

### Code Quality

```bash
pnpm lint              # ESLint
pnpm lint:fix          # ESLint with auto-fix
pnpm lint:styles       # Stylelint
pnpm lint:styles:fix   # Stylelint with auto-fix
pnpm format            # Prettier
pnpm test              # run unit tests
```

## API Docs

Interactive API documentation is available at `http://localhost:3000/api-docs` when the dev server is running (powered by [Scalar](https://scalar.com)).

## Project Structure

```
├── app/                  # Nuxt frontend (Feature-Sliced Design)
│   ├── entities/         # Business objects: product, user, category, cart
│   ├── features/         # User interactions: add to cart, search, auth
│   ├── widgets/          # Composite UI blocks: header, footer, product grid
│   ├── shared/           # UI kit, API client, utilities, types
│   └── assets/styles/    # SCSS design system
├── server/
│   ├── api/              # Nitro route handlers
│   └── lib/              # Shared server utilities and validation schemas
├── prisma/               # Schema, migrations, seed
├── tests/                # Vitest unit tests
├── config/               # Prettier, Stylelint, Vitest, Prisma configs
└── docker/               # Dockerfiles and Compose files
```

## Roadmap

- [x] Authentication (JWT + refresh tokens)
- [ ] Product catalog pages with filtering UI
- [ ] Product detail page
- [ ] Shopping cart UI
- [ ] Checkout flow and order management
- [ ] Admin dashboard
- [ ] Search with debounce
- [ ] Product reviews and ratings
- [ ] Wishlist
- [ ] PWA
