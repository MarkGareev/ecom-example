.PHONY: help dev down logs up prod-down prod-logs studio migrate push seed

COMPOSE_DEV  = docker compose -f docker/docker-compose.dev.yml
COMPOSE_PROD = docker compose -f docker/docker-compose.yml

# ─── Development ──────────────────────────────────────────────────────────────

dev:
	$(COMPOSE_DEV) down --remove-orphans
	$(COMPOSE_DEV) up -d --build

down:
	$(COMPOSE_DEV) down --remove-orphans

logs:
	$(COMPOSE_DEV) logs -f app

# ─── Production ───────────────────────────────────────────────────────────────

up:
	$(COMPOSE_PROD) down --remove-orphans
	$(COMPOSE_PROD) up -d --build

prod-down:
	$(COMPOSE_PROD) down --remove-orphans

prod-logs:
	$(COMPOSE_PROD) logs -f app

# ─── Database ─────────────────────────────────────────────────────────────────

studio:
	pnpm dotenvx run -f .env -- pnpm db:studio

migrate:
	pnpm db:migrate

push:
	pnpm db:push

seed:
	pnpm db:seed

# ─── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo "Dev:        make dev | make down | make logs"
	@echo "Prod:       make up  | make prod-down | make prod-logs"
	@echo "Database:   make studio | make migrate | make push | make seed"
