FROM node:22-alpine AS base
WORKDIR /app

# ── development ───────────────────────────────────────────────
FROM base AS development
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# ── build ─────────────────────────────────────────────────────
FROM base AS build
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# ── production ────────────────────────────────────────────────
FROM nginx:alpine AS production
RUN apk add --no-cache gettext
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
EXPOSE 80
CMD ["/bin/sh", "-c", "PORT=${PORT:-80} envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
