# 🎮 Cyberpunk Portfolio 2026

A modern, cyberpunk-themed portfolio website built with Nuxt 3, featuring a gaming-inspired UI with neon aesthetics and smooth animations.

![Nuxt](https://img.shields.io/badge/Nuxt-3-00DC82?logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.0-000000?logo=bun&logoColor=white)

## ✨ Features

- 🎨 **Cyberpunk Design** - Neon colors, retro-futuristic UI with gaming aesthetics
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop devices
- ⚡ **Fast Performance** - Built with Nuxt 3 and powered by Bun runtime
- 🎯 **Interactive Sections**:
  - Hero with animated grid background and typing effect
  - Work history showcase
  - Skills tree with XP bars
  - Quest log (projects) with live demo links
  - Credentials log (education and certifications)
  - Social media connect section
- 🎭 **Smooth Animations** - Glitch effects, hover transitions, and parallax scrolling
- 🚀 **SEO Optimized** - Meta tags and semantic HTML structure
- 🐳 **Docker Ready** - Development and production Docker configurations

## 🛠️ Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/)
- **UI**: [Vue 3](https://vuejs.org/) + [TailwindCSS](https://tailwindcss.com/)
- **Runtime**: [Bun](https://bun.sh/)
- **Containerization**: Docker

## 📋 Prerequisites

- [Bun](https://bun.sh/) 1.0 or higher (recommended)
- Node.js 18+ (alternative)
- Docker (optional, for containerized deployment)

## 🚀 Getting Started

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd portafolio-2026
```

2. **Install dependencies**
```bash
bun install
```

3. **Start development server**
```bash
bun run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Build the application
bun run build

# Preview production build locally
bun run preview
```

## 🐳 Docker Deployment

### Development with Docker

```bash
# Build and run development container
docker-compose -f docker-compose.dev.yml up --build

# Run in detached mode
docker-compose -f docker-compose.dev.yml up -d
```

### Production with Docker

```bash
# Build and run production container
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

The containerized app will be available at `http://localhost:3000`

## 📁 Project Structure

```
portafolio-2026/
├── app/
│   └── app.vue              # Main application component
├── public/
│   ├── yo.webp             # Profile image
│   ├── images/             # Company logos
│   └── icons/              # Technology icons
├── Dockerfile              # Production Docker configuration
├── Dockerfile.dev          # Development Docker configuration
├── docker-compose.yml      # Production compose file
├── docker-compose.dev.yml  # Development compose file
├── nuxt.config.ts          # Nuxt configuration
├── tailwind.config.js      # Tailwind configuration
├── package.json            # Dependencies
└── bun.lock               # Bun lockfile
```

## 🎨 Customization

<!-- ### Update Personal Information

Edit the constants in `app/app.vue`:

```javascript
// Personal info
const fullName = 'YOUR NAME'

// Stats
const stats = [
  { label: 'PROJECTS', value: '50+' },
  { label: 'COMMITS', value: '2.5K' },
  { label: 'COFFEE', value: '∞' }
]

// Work history
const companies = [
  {
    name: 'COMPANY_NAME',
    role: 'Your Role',
    period: 'Date Range',
    logo: '/images/company-logo.png',
    tech: ['Tech1', 'Tech2']
  }
]

// Skills
const skills = [
  { name: 'SKILL_NAME', icon: '/icons/skill.svg', level: 90 }
]

// Projects
const projects = [
  {
    name: 'PROJECT_NAME',
    type: 'MAIN_QUEST',
    description: 'Project description',
    tech: ['Tech1', 'Tech2'],
    xp: 1000,
    completed: true,
    redirect: 'https://project-url.com'
  }
]

// Social links
const socialLinks = [
  {
    name: 'GITHUB',
    icon: '⬡',
    handle: '@yourusername',
    url: 'https://github.com/yourusername'
  }
]
``` -->

### Change Colors

The color scheme uses Tailwind's color palette. Main colors used:
- **Primary**: Fuchsia/Pink (`fuchsia-500`, `pink-500`)
- **Secondary**: Cyan (`cyan-400`)
- **Background**: Slate (`slate-950`, `slate-900`)

Modify these in the component classes or extend in `tailwind.config.js`.

### Add/Remove Sections

The portfolio is structured in sections with IDs:
- `#home` - Hero section
- `#work` - Work history
- `#skills` - Skills tree
- `#quests` - Projects/Quest log
- `#credentials` - Education and certifications
- `#connect` - Social links

Update the `navItems` array to match your sections:
```javascript
const navItems = ['HOME', 'WORK', 'SKILLS', 'QUESTS', 'CREDENTIALS', 'CONNECT']
```

## 🌐 Deployment

### Vercel (Recommended for Nuxt)
1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy automatically

### Netlify
1. Push your code to GitHub
2. Connect repository in [Netlify](https://netlify.com)
3. Build command: `bun run build`
4. Publish directory: `.output/public`

### Docker (Self-hosted)
Use the production Dockerfile for deployment on any Docker-compatible hosting.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Pablo Cabrera**
- GitHub: [@Mrroboto9819](https://github.com/Mrroboto9819)
- LinkedIn: [pablo-cabrera-castrejon](https://www.linkedin.com/in/pablo-cabrera-castrejon/)
- Email: pablo.cabrera.castrejon@gmail.com

<!-- ## 🤝 Contributing

Contributions, issues, and feature requests are welcome! -->

## ⭐ Show your support

Give a ⭐️ if you like this project!

---

Built with 💜 using Nuxt 3 and TailwindCSS
