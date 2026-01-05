# Install dependencies only when needed
FROM oven/bun:1 as base
LABEL fly_launch_runtime="Bun"
WORKDIR /app


# Install dependencies with bun
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --no-save --frozen-lockfile

ARG IMAGES_PACK_URL
ARG THUMBNAILS_PACK_URL

RUN apt-get update && apt-get install -y curl
RUN curl -L "${THUMBNAILS_PACK_URL}" | tar -xzf - -C ./
RUN curl -L "${IMAGES_PACK_URL}" | tar -xzf - -C ./


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/images ./public/images
COPY --from=deps /app/thumbnails ./public/thumbnails
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Build
RUN bunx --bun prisma generate
RUN bun run build

# RUN mkdir -p .next/cache/fetch-cache
# RUN mkdir -p .next/cache/images
# RUN mkdir -p .next/cache/webpack
run chmod -R 777 .next/


# Production image, copy all the files and run next
FROM builder AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN groupadd --system --gid 1001 nodejs 
RUN useradd --system --uid 1001 --no-log-init -g nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs
CMD ["bun", "./server.js"]