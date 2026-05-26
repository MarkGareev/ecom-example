.PHONY: dev dev-down dev-logs up down logs db studio migrate push seed

# ─── Dev ─────────────────────────────────────────────────────────────────────

dev:
	docker compose -f docker-compose.dev.yml up -d

dev-down:
	docker compose -f docker-compose.dev.yml down

dev-logs:
	docker compose -f docker-compose.dev.yml logs -f app

# ─── Production ──────────────────────────────────────────────────────────────

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f app

# ─── Prisma ──────────────────────────────────────────────────────────────────

studio:
	pnpm db:studio

migrate:
	pnpm db:migrate

push:
	pnpm db:push

seed:
	pnpm db:seed
