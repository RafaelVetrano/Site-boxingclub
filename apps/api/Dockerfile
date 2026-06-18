FROM node:22-alpine AS base
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# ── development ──────────────────────────────────────────────
FROM base AS development
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN pnpm install
RUN pnpm prisma generate
COPY . .
EXPOSE 3001
CMD ["pnpm", "dev"]

# ── build ─────────────────────────────────────────────────────
FROM base AS build
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate
COPY . .

# ── production ────────────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
RUN mkdir -p uploads
EXPOSE 3001
CMD ["node", "dist/server.js"]
