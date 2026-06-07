.PHONY: dev dev-down dev-logs up down logs db studio migrate push seed

COMPOSE_DEV = docker compose -f docker/docker-compose.dev.yml --env-file .env
COMPOSE_PROD = docker compose -f docker/docker-compose.yml --env-file .env

# ─── Dev ─────────────────────────────────────────────────────────────────────

dev:
	$(COMPOSE_DEV) up -d

dev-down:
	$(COMPOSE_DEV) down

dev-logs:
	$(COMPOSE_DEV) logs -f app

# ─── Production ──────────────────────────────────────────────────────────────

up:
	$(COMPOSE_PROD) up -d --build

down:
	$(COMPOSE_PROD) down

logs:
	$(COMPOSE_PROD) logs -f app

# ─── Prisma ──────────────────────────────────────────────────────────────────

studio:
	pnpm db:studio

migrate:
	pnpm db:migrate

push:
	pnpm db:push

seed:
	pnpm db:seed
