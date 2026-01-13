import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
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
