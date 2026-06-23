FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# ── development ───────────────────────────────────────────────
FROM base AS development
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN pnpm install
RUN pnpm prisma generate
COPY . .
EXPOSE 3001
CMD ["pnpm", "dev"]

# ── build ─────────────────────────────────────────────────────
FROM base AS build
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

# ── production ────────────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY --from=build /app/dist ./dist
RUN mkdir -p uploads
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
