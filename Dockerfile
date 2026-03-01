FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma/
RUN bun install --frozen-lockfile

COPY . .

RUN bun run prisma generate

RUN bun run build

FROM oven/bun:1-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/lib/genereted ./src/lib/genereted

RUN bun install --production

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000


CMD ["bun", "run", "build/index.js"]
