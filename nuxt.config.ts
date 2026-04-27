import { execSync } from "node:child_process";
import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json";

// https://nuxt.com/docs/api/configuration/nuxt-config
const adminLoginMaxAttempts = Number.parseInt(process.env.ADMIN_LOGIN_MAX_ATTEMPTS || '10', 10)
const adminInfoMaxRequests = Number.parseInt(process.env.ADMIN_INFO_MAX_REQUESTS || '120', 10)
const adminRateLimitWindowSeconds = Number.parseInt(process.env.ADMIN_RATE_LIMIT_WINDOW_SECONDS || '900', 10)
const adminRestartMaxRequests = Number.parseInt(process.env.ADMIN_RESTART_MAX_REQUESTS || '5', 10)

// Build version, formatted "LoL-style":
//   <env>-v<pkg.version>-<DD-MM-YYYY>-build:<sha>
// e.g. production-v5.0.0-27-04-2026-build:a1b2c3d
//
// `nuxt.config.ts` runs once at build time, so the formatted string gets
// baked into runtimeConfig.public.appVersion. The footer (and /api/v1/health)
// will report exactly the build that produced the running container.
//
// Components:
//   v<...>          ← package.json `version` (semver — bump when you ship)
//   <DD-MM-YYYY>    ← `new Date()` at build time (always today)
//   build:<sha>     ← short git SHA (CI) / local git (deploy-prod.sh)
//
// Inputs (all optional — sensible fallbacks when unset):
//   APP_VERSION  — full pre-formatted string. Bypasses everything.
//   APP_ENV      — "production" | "develop" | branch name. Default: derive
//                  from git branch ("main"/"master" → "production"), else "local".
//   APP_COMMIT   — short SHA. Default: from git, else "unknown".
function gitOutput(cmd: string): string | null {
  try {
    const out = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    return out || null
  } catch {
    return null
  }
}

function deriveEnv(): string {
  const explicit = process.env.APP_ENV?.trim()
  if (explicit) return explicit
  const branch = gitOutput('git rev-parse --abbrev-ref HEAD')
  if (!branch || branch === 'HEAD') return 'local'
  if (branch === 'main' || branch === 'master') return 'production'
  return branch
}

function deriveCommit(): string {
  const explicit = process.env.APP_COMMIT?.trim()
  if (explicit) return explicit
  const sha = gitOutput('git rev-parse --short HEAD')
  if (!sha) return 'unknown'
  const dirty = gitOutput('git diff --quiet || echo dirty') === 'dirty'
  return dirty ? `${sha}-dirty` : sha
}

function todayDDMMYYYY(): string {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}-${mm}-${d.getFullYear()}`
}

function resolveAppVersion(): string {
  const explicit = process.env.APP_VERSION?.trim()
  if (explicit) return explicit

  const env = deriveEnv()
  const date = todayDDMMYYYY()
  const commit = deriveCommit()
  return `${env}-v${pkg.version}-${date}-build:${commit}`
}

const appVersion = resolveAppVersion()

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      appVersion,
    },
    adminLoginMaxAttempts: Number.isFinite(adminLoginMaxAttempts) ? adminLoginMaxAttempts : 10,
    adminInfoMaxRequests: Number.isFinite(adminInfoMaxRequests) ? adminInfoMaxRequests : 120,
    adminRateLimitWindowSeconds: Number.isFinite(adminRateLimitWindowSeconds) ? adminRateLimitWindowSeconds : 900,
    adminRestartMaxRequests: Number.isFinite(adminRestartMaxRequests) ? adminRestartMaxRequests : 5,
  },
  modules: ['@nuxtjs/i18n'],
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'es', name: 'Espanol', file: 'es.json' }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales',
  },
  app: {
    head: {
      title: 'Pablo Cabrera - Full Stack Developer',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Pablo Cabrera - Full Stack Developer specializing in Vue.js, React, Django, and modern web technologies. Portfolio showcasing professional experience at DokitPro, Alluxi, and Innovaciones 20 Veinte.' },
        { name: 'keywords', content: 'Pablo Cabrera, Full Stack Developer, Vue.js, React, Django, Web Developer, Frontend Developer, Backend Developer, JavaScript, Python, Node.js' },
        { name: 'author', content: 'Pablo Cabrera' },
        { property: 'og:title', content: 'Pablo Cabrera - Full Stack Developer' },
        { property: 'og:description', content: 'Full Stack Developer specializing in Vue.js, React, Django, and modern web technologies.' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Pablo Cabrera - Full Stack Developer' },
        { name: 'twitter:description', content: 'Full Stack Developer specializing in Vue.js, React, Django, and modern web technologies.' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
