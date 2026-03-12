import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json";
// https://nuxt.com/docs/api/configuration/nuxt-config
const adminSessionTtlSeconds = Number.parseInt(process.env.ADMIN_SESSION_TTL_SECONDS || '900', 10)
const adminLoginMaxAttempts = Number.parseInt(process.env.ADMIN_LOGIN_MAX_ATTEMPTS || '10', 10)
const adminInfoMaxRequests = Number.parseInt(process.env.ADMIN_INFO_MAX_REQUESTS || '120', 10)
const adminRateLimitWindowSeconds = Number.parseInt(process.env.ADMIN_RATE_LIMIT_WINDOW_SECONDS || '900', 10)
const adminRestartMaxRequests = Number.parseInt(process.env.ADMIN_RESTART_MAX_REQUESTS || '5', 10)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      appVersion: pkg.version,
    },
    adminSessionTtlSeconds: Number.isFinite(adminSessionTtlSeconds) ? adminSessionTtlSeconds : 900,
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
