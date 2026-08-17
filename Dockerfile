FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:latest AS runner
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080
CMD ["bun", "run", "src/server.ts"]
