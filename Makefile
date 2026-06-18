.PHONY: up down logs migrate seed reset shell-api shell-db

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose exec api pnpm prisma migrate deploy

seed:
	docker compose exec api pnpm prisma db seed

reset:
	docker compose exec api pnpm prisma migrate reset --force

shell-api:
	docker compose exec api sh

shell-db:
	docker compose exec db psql -U boxing boxingclub
