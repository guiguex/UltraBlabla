# Étape 1 : Build
FROM oven/bun:1.4-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install
COPY . .
RUN bun run build

# Étape 2 : Production
FROM oven/bun:1.4-alpine
WORKDIR /app
COPY --from=builder /app /app
ENV NODE_ENV=production
ENV PORT=44432
EXPOSE 44432
CMD ["bun", "run", "src/server.ts"]
