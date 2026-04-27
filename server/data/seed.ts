// Initial content for the public-read collections, lifted verbatim from the
// legacy hardcoded arrays in app/pages/index.vue. The seed plugin inserts
// these on first boot only — once a collection has any document, it is left
// alone, so admin edits in production survive future deploys.

export const seedStats = [
  { label: 'PROJECTS', value: '50+', icon: '/icons/ui/calendar.svg' },
  { label: 'COFFEE', value: '∞', icon: '/icons/ui/smile.svg' },
]

export const seedCompanies = [
  {
    name: 'DOKITPRO',
    role: 'Programador Fullstack',
    period: 'Feb 2024 - Actualidad',
    logo: '/images/dokitpro.png',
    tech: ['Vue3', 'Django', 'Frontend'],
  },
  {
    name: 'ALLUXI',
    role: 'Programadora Full Stack',
    period: 'Jun 2022 - Sept 2024',
    logo: '/images/alluxi.png',
    tech: ['Django', 'Vue.js', 'Nuxt', 'React', 'React Native', '.NET'],
  },
  {
    name: 'I20VEINTE',
    role: 'Web Developer',
    period: 'Nov 2021 - May 2022',
    logo: '/images/i20veinte.png',
    tech: ['PHP', 'React.js', 'NestJS', 'Node.js', 'WordPress'],
  },
]

export const seedSkills = [
  { name: 'JAVASCRIPT', icon: '/icons/javascript.svg', level: 100 },
  { name: 'VUE.JS', icon: '/icons/vuedotjs.svg', level: 100 },
  { name: 'REACT', icon: '/icons/react.svg', level: 100 },
  { name: 'NODE.JS', icon: '/icons/nodedotjs.svg', level: 100 },
  { name: 'PYTHON', icon: '/icons/python.svg', level: 100 },
  { name: 'FLASK', icon: '/icons/flask.svg', level: 100 },
  { name: 'DJANGO', icon: '/icons/django.svg', level: 100 },
  { name: 'NEXT', icon: '/icons/nextdotjs.svg', level: 100 },
  { name: 'NUXT', icon: '/icons/nuxt.svg', level: 100 },
  { name: 'MYSQL', icon: '/icons/mysql.svg', level: 100 },
  { name: 'MONGODB', icon: '/icons/mongodb.svg', level: 100 },
  { name: 'DOCKER', icon: '/icons/docker.svg', level: 100 },
]

export const seedProjects = [
  {
    name: 'PORTAFOLIO_2026',
    type: 'MAIN_QUEST',
    description: 'Portfolio page for my presentations',
    tech: ['Nuxtjs', 'TailwindCSS'],
    xp: 1000,
    completed: true,
    redirect: '/',
    platforms: [],
  },
  {
    name: 'CATALOG_MAKER',
    type: 'SIDE_QUEST',
    description: 'Product catalog creation and management platform',
    tech: ['Nuxtjs', 'TailwindCSS'],
    xp: 750,
    completed: true,
    redirect: 'https://monitor.pablocabrera.dev/',
    platforms: [],
  },
  {
    name: 'ECOMMERCE_DEMO',
    type: 'SIDE_QUEST',
    description: 'Ecommerce demo frontend and backend',
    tech: ['Nuxtjs', 'TailwindCSS', 'Django', 'PostgreSQL'],
    xp: 1000,
    completed: true,
    redirect: 'https://store.pablocabrera.dev/',
    platforms: [],
  },
  {
    name: 'TASK_MANAGER_DESKTOP_APP',
    type: 'SIDE_QUEST',
    description: 'Task manager desktop app',
    tech: ['TAURI', 'SVELTE'],
    xp: 3000,
    completed: true,
    redirect: 'https://store.pablocabrera.dev/',
    platforms: [
      { name: 'Windows', icon: '/icons/os/windows.svg', url: 'https://github.com/Mrroboto9819/FlowStack-desktop/releases/latest/download/FlowStack_4.0.1_x64_en-US.msi' },
      { name: 'Linux',   icon: '/icons/os/linux.svg',   url: 'https://github.com/Mrroboto9819/FlowStack-desktop/releases/latest/download/FlowStack_4.0.1_amd64.deb' },
      { name: 'macOS',   icon: '/icons/os/apple.svg',   url: 'https://github.com/Mrroboto9819/FlowStack-desktop/releases/latest/download/FlowStack_4.0.1_aarch64.dmg' },
    ],
  },
  {
    name: 'OCHAT',
    type: 'SIDE_QUEST',
    description: 'Chat app',
    tech: ['Nextjs', 'TailwindCSS', 'Typescript'],
    xp: 1000,
    completed: true,
    redirect: 'https://ochat.pablocabrera.dev/',
    platforms: [],
  },
  {
    name: 'ADOPTME_WEBAPP',
    type: 'SIDE_QUEST',
    description: 'AdoptMe WebApp',
    tech: ['SVELTEKIT', 'TAILWIND', 'TYPESCRIPT'],
    xp: 3000,
    completed: true,
    redirect: 'https://adoptme.community/',
    platforms: [],
  },
]

export const seedSocial = [
  {
    name: 'GITHUB',
    icon: '/icons/ui/github.svg',
    handle: '@Mrroboto9819',
    url: 'https://github.com/Mrroboto9819',
  },
  {
    name: 'LINKEDIN',
    icon: '/icons/ui/linkedin.svg',
    handle: 'pablo-cabrera-castrejon',
    url: 'https://www.linkedin.com/in/pablo-cabrera-castrejon/',
  },
  {
    name: 'EMAIL',
    icon: '/icons/ui/envelope-fill-24.svg',
    handle: 'pablo.cabrera.castrejon@gmail.com',
    url: 'mailto:pablo.cabrera.castrejon@gmail.com',
  },
]

export const seedCredentials = [
  {
    type: 'DEGREE',
    title: 'Ingeniería en Sistemas Computacionales',
    institution: 'Universidad del Valle de México',
    period: 'JUN 2018 - DEC 2022',
    field: 'Desarrollo de aplicaciones web',
    image: null,
  },
  { type: 'CERTIFICATE', title: 'Working with Data', institution: 'Meta', period: 'JAN 2026', skills: ['SQL', 'JSON', 'APIs'], credentialId: 'QLM16WJACL1R', image: '/images/certs/meta_logo.png' },
  { type: 'CERTIFICATE', title: 'Continuous Integration & Continuous Deployment with Jenkins', institution: 'LearnKartS', period: 'MAY 2025', credentialId: 'N32R63CR6U8W', skills: ['CI/CD', 'Jenkins'], image: '/images/certs/learnkarts_logo.png' },
  { type: 'CERTIFICATE', title: 'DevOps and Jenkins Fundamentals', institution: 'LearnKartS', period: 'MAY 2025', skills: ['DevOps', 'Jenkins'], credentialId: '6D9VKRZQ2K6K', image: '/images/certs/learnkarts_logo.png' },
  { type: 'CERTIFICATE', title: 'Django Application Development with SQL and Databases', institution: 'IBM', period: 'JAN 2024', credentialId: 'EDVQ9GMKGZCG', skills: ['Django', 'SQL', 'Databases'], image: '/images/certs/ibm_logo.jpg' },
  { type: 'CERTIFICATE', title: 'Python for Data Science, AI & Development', institution: 'IBM', period: 'JAN 2024', credentialId: '65RCXR2AFP5K', skills: ['Python'], image: '/images/certs/ibm_logo.jpg' },
  { type: 'CERTIFICATE', title: 'Introduction to Web Development with HTML, CSS, JavaScript', institution: 'IBM', period: 'JAN 2024', credentialId: 'WWAEGLJMJV7D', skills: ['HTML5', 'CSS', 'JavaScript'], image: '/images/certs/ibm_logo.jpg' },
  { type: 'CERTIFICATE', title: 'Version Control', institution: 'Meta', period: 'NOV 2024', skills: ['Git', 'GitHub', 'GitLabs'], credentialId: 'LPZF8LWB4K2K', image: '/images/certs/meta_logo.png' },
  { type: 'CERTIFICATE', title: 'Programming with JavaScript', institution: 'Meta', period: 'NOV 2024', skills: ['JavaScript', 'HTML5', 'CSS'], credentialId: '1JO6B9UW2MTE', image: '/images/certs/meta_logo.png' },
  { type: 'CERTIFICATE', title: 'React Basics', institution: 'Meta', period: 'NOV 2024', skills: ['React', 'JavaScript', 'HTML5', 'CSS'], credentialId: 'WYDPPD1X5E7A', image: '/images/certs/meta_logo.png' },
  { type: 'CERTIFICATE', title: 'Introduction to Mobile Development', institution: 'Meta', period: 'NOV 2024', skills: ['React Native', 'Android Studio', 'iOS'], credentialId: 'BY5NCO4NL97L', image: '/images/certs/meta_logo.png' },
  { type: 'CERTIFICATE', title: 'React Native', institution: 'Meta', period: 'NOV 2023', skills: ['React Native'], credentialId: '3VJTVXZAS04W', image: '/images/certs/meta_logo.png' },
]
