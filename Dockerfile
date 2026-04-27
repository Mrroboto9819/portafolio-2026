FROM docker.io/oven/bun:1-alpine AS build

# Version components — formatted by nuxt.config.ts as
#   <env>-v<pkg.version>-<DD-MM-YYYY>-build:<sha>
# CI passes APP_ENV / APP_COMMIT; deploy-prod.sh derives them from local git.
# pkg.version comes from package.json (mounted into the build context).
# APP_VERSION is the escape hatch (used verbatim if set).
ARG APP_VERSION=""
ARG APP_ENV=""
ARG APP_COMMIT=""
ENV APP_VERSION=$APP_VERSION \
    APP_ENV=$APP_ENV \
    APP_COMMIT=$APP_COMMIT

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# --- Production stage ---
FROM docker.io/oven/bun:1-alpine

WORKDIR /app

COPY --from=build /app/.output .output

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
