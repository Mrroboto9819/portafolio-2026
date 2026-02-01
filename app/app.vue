<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-mono overflow-hidden relative">
    <!-- Animated grid background -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div
        class="absolute inset-0 opacity-20"
        :style="{
          backgroundImage: 'linear-gradient(to right, #f0abfc 1px, transparent 1px), linear-gradient(to bottom, #f0abfc 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          transform: `perspective(500px) rotateX(60deg) translateY(${scrollY * 0.5}px)`,
          transformOrigin: 'center top'
        }"
      />
      <!-- Glow orbs with parallax -->
      <div
        class="absolute top-20 left-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse"
        :style="{ transform: `translateY(${scrollY * 0.3}px)` }"
      />
      <div
        class="absolute bottom-40 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
        style="animation-delay: 1s"
        :style="{ transform: `translateY(${scrollY * -0.2}px)` }"
      />
      <!-- Additional floating orb for more depth -->
      <div
        class="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl animate-pulse"
        style="animation-delay: 2s"
        :style="{ transform: `translateY(${scrollY * 0.4}px) translateX(${scrollY * 0.1}px)` }"
      />
    </div>

    <!-- Scanlines overlay -->
    <div 
      class="fixed inset-0 pointer-events-none z-50 opacity-5"
      :style="{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
      }"
    />

    <!-- Navigation HUD -->
    <nav 
      class="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-4 bg-slate-950/80 backdrop-blur-sm transition-transform duration-300"
      :class="isNavVisible ? 'translate-y-0' : '-translate-y-full'"
    >
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-fuchsia-500 animate-pulse" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" />
          <span class="text-fuchsia-400 text-xs sm:text-sm tracking-widest">PLAYER_01</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden xl:flex items-center gap-4 lg:gap-6">
          <button
            v-for="(item, index) in navItems"
            :key="item"
            @click="scrollToSection(item.toLowerCase())"
            class="relative px-3 lg:px-4 py-2 text-xs tracking-wider transition-all duration-300 group"
            :class="activeSection === item.toLowerCase() ? 'text-cyan-400' : 'text-slate-400 hover:text-fuchsia-400'"
          >
            <span class="relative z-10">{{ $t(item) }}</span>
            <div
              v-if="activeSection === item.toLowerCase()"
              class="absolute inset-0 border border-cyan-400/50 bg-cyan-400/10"
              style="clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))"
            />
          </button>

          <!-- Language Switcher (Desktop) -->
          <div class="flex items-center gap-2 border-l border-slate-700 pl-4">
            <button 
              @click="setLocale('en')" 
              class="w-6 h-4 hover:scale-110 transition-transform"
              :class="{ 'ring-2 ring-cyan-400': locale === 'en' }"
            >
              <img src="/icons/usa.svg" alt="English" class="w-full h-full object-cover flag-icon" />
            </button>
            <button 
              @click="setLocale('es')" 
              class="w-6 h-4 hover:scale-110 transition-transform"
              :class="{ 'ring-2 ring-cyan-400': locale === 'es' }"
            >
              <img src="/icons/mx.svg" alt="Español" class="w-full h-full object-cover flag-icon" />
            </button>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="xl:hidden p-2 text-cyan-400 hover:text-fuchsia-400 transition-colors"
        >
          <div class="w-6 h-5 flex flex-col justify-between">
            <span class="w-full h-0.5 bg-current transition-all" :class="mobileMenuOpen ? 'rotate-45 translate-y-2' : ''" />
            <span class="w-full h-0.5 bg-current transition-all" :class="mobileMenuOpen ? 'opacity-0' : ''" />
            <span class="w-full h-0.5 bg-current transition-all" :class="mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''" />
          </div>
        </button>

        <div class="hidden xl:flex items-center gap-2 text-xs text-slate-500">
          <span>LVL</span>
          <span class="text-cyan-400 font-bold">42</span>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div
        v-show="mobileMenuOpen"
        class="xl:hidden mt-4 border-t border-slate-700/50 pt-4"
      >
        <div class="flex flex-col gap-2">
          <button
            v-for="(item, index) in navItems"
            :key="item"
            @click="scrollToSection(item.toLowerCase()); mobileMenuOpen = false"
            class="relative px-4 py-3 text-left text-sm tracking-wider transition-all duration-300"
            :class="activeSection === item.toLowerCase() ? 'text-cyan-400 bg-cyan-400/10 border-l-2 border-cyan-400' : 'text-slate-400 hover:text-fuchsia-400 hover:bg-fuchsia-400/5'"
          >
            {{ $t(item) }}
          </button>
          
          <!-- Language Switch (Mobile) -->
          <div class="flex items-center gap-4 px-4 py-2 mt-2 border-t border-slate-800">
             <button 
              @click="setLocale('en'); mobileMenuOpen = false" 
              class="flex items-center gap-2 text-xs tracking-wider"
              :class="locale === 'en' ? 'text-cyan-400' : 'text-slate-400'"
            >
              <img src="/icons/usa.svg" alt="English" class="w-6 h-4 object-cover flag-icon" />
              ENGLISH
            </button>
            <button 
              @click="setLocale('es'); mobileMenuOpen = false" 
              class="flex items-center gap-2 text-xs tracking-wider"
              :class="locale === 'es' ? 'text-cyan-400' : 'text-slate-400'"
            >
              <img src="/icons/mx.svg" alt="Español" class="w-6 h-4 object-cover flag-icon" />
              ESPAÑOL
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Parallax floating elements -->
    <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <!-- Floating triangles -->
      <div
        class="absolute top-1/4 left-10 w-16 h-16 border border-cyan-400/20"
        :style="{ transform: `translateY(${scrollY * 0.6}px) rotate(${scrollY * 0.1}deg)`, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }"
      />
      <div
        class="absolute top-1/3 right-20 w-12 h-12 border border-fuchsia-400/20"
        :style="{ transform: `translateY(${scrollY * -0.4}px) rotate(${scrollY * -0.15}deg)`, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }"
      />
      <!-- Floating hexagons -->
      <div
        class="absolute top-2/3 left-1/4 w-20 h-20 border border-pink-400/15"
        :style="{ transform: `translateY(${scrollY * 0.35}px) rotate(${scrollY * 0.08}deg)`, clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }"
      />
      <div
        class="absolute bottom-1/4 right-1/3 w-14 h-14 border border-cyan-400/15"
        :style="{ transform: `translateY(${scrollY * -0.5}px) rotate(${scrollY * -0.12}deg)`, clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }"
      />
      <!-- Small circles -->
      <div
        class="absolute top-1/2 left-1/3 w-8 h-8 border border-fuchsia-400/20 rounded-full"
        :style="{ transform: `translateY(${scrollY * 0.7}px) translateX(${scrollY * 0.05}px)` }"
      />
      <div
        class="absolute bottom-1/3 right-1/4 w-10 h-10 border border-pink-400/20 rounded-full"
        :style="{ transform: `translateY(${scrollY * -0.6}px) translateX(${scrollY * -0.08}px)` }"
      />
    </div>

    <!-- Main content -->
    <main class="relative z-10 pt-20 sm:pt-24 px-4 sm:px-6">
      <!-- Hero Section -->
      <section id="home" class="max-w-6xl mx-auto min-h-screen flex items-center py-12 sm:py-0">
        <div class="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center w-full">
          <div class="space-y-6 sm:space-y-8">
            <!-- Status indicator -->
            <div class="hero-status flex items-center gap-3">
              <div class="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              <img src="/icons/ui/robot-2.svg" alt="status" class="w-4 h-4" />
              <span class="text-cyan-400 text-xs tracking-widest">{{ $t('HERO.STATUS') }}</span>
            </div>

            <!-- Main title with glitch effect -->
            <div class="hero-title space-y-2">
              <h1
                class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight break-words"
                :class="glitching ? 'animate-glitch' : ''"
              >
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-400">
                  {{ displayedName }}
                </span>
                <span class="animate-pulse text-fuchsia-400">_</span>
              </h1>
              <p class="text-base sm:text-lg md:text-xl text-slate-400">
                <span class="text-cyan-400">&lt;</span>
                {{ $t('HERO.ROLE') }}
                <span class="text-cyan-400">/&gt;</span>
              </p>
            </div>

            <!-- Stats HUD -->
            <div class="hero-stats grid grid-cols-3 gap-2 sm:gap-4">
              <div
                v-for="stat in stats"
                :key="stat.label"
                class="p-2 sm:p-4 border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm relative overflow-hidden group hover:border-fuchsia-500/50 transition-colors"
                style="clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div class="flex items-center gap-2 mb-1">
                   <img v-if="stat.icon" :src="stat.icon" :alt="stat.label" class="w-4 h-4 opacity-70" />
                   <div class="text-lg sm:text-2xl font-bold text-fuchsia-400">{{ stat.value }}</div>
                </div>
                <div class="text-[10px] sm:text-xs text-slate-500 tracking-wider">{{ stat.label }}</div>
              </div>
            </div>

            <!-- CTA buttons -->
            <div class="hero-buttons flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                @mouseenter="hoverSound"
                @click="scrollToSection('work')"
                class="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white text-sm sm:text-base font-bold tracking-wider relative overflow-hidden group cursor-pointer"
                style="clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))"
              >
                <span class="relative z-10">{{ $t('HERO.START_GAME') }}</span>
                <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-fuchsia-500 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </button>
              <button
                @click="scrollToSection('skills')"
                class="px-6 sm:px-8 py-3 sm:py-4 border border-cyan-400/50 text-cyan-400 text-sm sm:text-base font-bold tracking-wider hover:bg-cyan-400/10 transition-colors cursor-pointer"
                style="clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))"
              >
                {{ $t('HERO.VIEW_STATS') }}
              </button>
            </div>
          </div>

          <!-- Character display -->
          <div class="relative flex items-center justify-center mt-8 lg:mt-0">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 border-2 border-fuchsia-500/30 rotate-45 animate-spin-slow shadow-sm shadow-white/20" />
              <div class="absolute w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 border-2 border-cyan-400/30 rotate-45 animate-spin-slow-reverse shadow-sm shadow-white/20" />
            </div>

            <!-- Character avatar -->
            <div class="hero-avatar relative z-10 p-4 sm:p-8">
              <div
                class="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-slate-900 border-2 border-fuchsia-500 relative overflow-hidden"
              >
                <!-- Profile image -->
                <img
                  src="/yo.webp"
                  alt="Profile"
                  class="w-full h-full object-cover"
                />
                <!-- Glow effect -->
                <div class="absolute -inset-2 bg-fuchsia-500/20 blur-xl -z-10" />
              </div>

              <!-- Health bar -->
              <div class="mt-3 sm:mt-4 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-fuchsia-400">{{ $t('HERO.HP') }}</span>
                  <span class="text-slate-400">{{ health }}/100</span>
                </div>
                <div class="h-2 bg-slate-800 overflow-hidden">
                  <div
                    class="hp-bar-fill h-full bg-gradient-to-r from-fuchsia-600 to-pink-500"
                    :style="{ width: `${health}%` }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Work History Section -->
      <section id="work" class="max-w-6xl mx-auto py-12 sm:py-16 md:py-24">
        <div class="section-title flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center whitespace-nowrap">
            <span class="text-cyan-400">[</span>
            <img src="/icons/ui/cyborg.svg" class="w-6 h-6 sm:w-8 sm:h-8 inline-block mx-2 icon-fuchsia" alt="icon" />
            {{ $t('SECTIONS.WORK.TITLE') }}
            <span class="text-cyan-400">]</span>
          </h2>
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div
            v-for="(company, index) in companies"
            :key="company.name"
            @mouseenter="activeCompany = index"
            @mouseleave="activeCompany = null"
            class="work-card p-6 border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm relative overflow-hidden group cursor-pointer transition-all duration-300"
            :class="activeCompany === index ? 'border-cyan-500/80 scale-105' : 'hover:border-fuchsia-400/50'"
            style="clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))"
          >
            <!-- Corner accent -->
            <div class="absolute top-0 right-0 w-5 h-5 bg-gradient-to-br from-cyan-500 to-fuchsia-500" style="clip-path: polygon(100% 0, 0 0, 100% 100%)" />

            <!-- Company logo -->
            <div class="w-full h-24 mb-4 flex items-center justify-center border border-fuchsia-400/30 bg-slate-800/50 p-4">
              <img :src="company.logo" :alt="company.name" class="max-w-full max-h-full object-contain" />
            </div>

            <h3 class="text-lg font-bold text-cyan-400 mb-1">{{ company.name }}</h3>
            <p class="text-sm text-fuchsia-400 mb-2">{{ company.role }}</p>
            <p class="text-xs text-slate-500 mb-3">{{ company.period }}</p>

            <!-- Tech stack -->
            <div class="flex flex-wrap gap-1 mb-3">
              <span
                v-for="tech in company.tech"
                :key="tech"
                class="px-2 py-0.5 text-xs border border-cyan-400/30 text-cyan-400 bg-cyan-400/5"
              >
                {{ tech }}
              </span>
            </div>

            <!-- Hover glow -->
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      <!-- Skills Section -->
      <section id="skills" class="max-w-6xl mx-auto py-12 sm:py-16 md:py-24">
        <div class="section-title flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center whitespace-nowrap">
            <span class="text-fuchsia-400">[</span>
            <img src="/icons/ui/hammer.svg" class="w-6 h-6 sm:w-8 sm:h-8 inline-block mx-2" alt="icon" />
            {{ $t('SECTIONS.SKILLS.TITLE') }}
            <span class="text-fuchsia-400">]</span>
          </h2>
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
        </div>

        <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <div
            v-for="(skill, index) in skills"
            :key="skill.name"
            @mouseenter="activeSkill = index"
            @mouseleave="activeSkill = null"
            class="skill-card p-3 sm:p-4 md:p-6 border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm relative overflow-hidden group cursor-pointer transition-all duration-300"
            :class="activeSkill === index ? 'border-fuchsia-500/80 sm:scale-105' : 'hover:border-cyan-400/50'"
            style="clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))"
          >
            <!-- Corner accent -->
            <div class="absolute top-0 right-0 w-3 h-3 sm:w-5 sm:h-5 bg-gradient-to-br from-fuchsia-500 to-pink-500" style="clip-path: polygon(100% 0, 0 0, 100% 100%)" />

            <!-- Skill icon -->
            <div class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-2 sm:mb-3 md:mb-4 flex items-center justify-center border border-cyan-400/50 bg-cyan-400/10 p-1 sm:p-2" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)">
              <img :src="skill.icon" :alt="skill.name" class="w-full h-full object-contain" />
            </div>

            <h3 class="text-sm sm:text-base md:text-lg font-bold text-fuchsia-400 mb-1 sm:mb-2">{{ skill.name }}</h3>
            
            <!-- XP Bar -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500">{{ $t('SECTIONS.SKILLS.XP') }}</span>
                <span class="text-cyan-400">{{ skill.level }}/100</span>
              </div>
              <div class="h-1.5 bg-slate-800 overflow-hidden">
                <div
                  class="xp-bar-fill h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                  :style="{ width: `${skill.level}%` }"
                />
              </div>
            </div>

            <!-- Hover glow -->
            <div class="absolute inset-0 bg-gradient-to-r from-fuchsia-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      <!-- Projects Section (Quest Log) -->
      <section id="quests" class="max-w-6xl mx-auto py-12 sm:py-16 md:py-24">
        <div class="section-title flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center whitespace-nowrap">
            <span class="text-cyan-400">[</span>
            <img src="/icons/ui/ghost.svg" class="w-6 h-6 sm:w-8 sm:h-8 inline-block mx-2 icon-fuchsia" alt="icon" />
            {{ $t('SECTIONS.QUESTS.TITLE') }}
            <span class="text-cyan-400">]</span>
          </h2>
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        </div>

        <!-- Instructions -->
        <div class="mb-6 sm:mb-8 p-3 sm:p-4 border border-cyan-400/30 bg-cyan-400/5 text-center">
          <p class="text-xs sm:text-sm text-cyan-400">
            <span class="text-fuchsia-400">▸</span> <span class="hidden sm:inline">{{ $t('SECTIONS.QUESTS.INSTRUCTIONS') }}</span><span class="sm:hidden">{{ $t('SECTIONS.QUESTS.INSTRUCTIONS_MOBILE') }}</span> <span class="text-fuchsia-400">◂</span>
          </p>
        </div>

        <div class="space-y-4 sm:space-y-6">
          <div
            v-for="(project, index) in projects"
            :key="project.name"
            @click="expandedProject = expandedProject === index ? null : index"
            class="quest-card border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-fuchsia-500/50 cursor-pointer"
            style="clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))"
          >
            <div class="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <!-- Quest status -->
              <div
                class="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center border-2 shrink-0 transition-colors duration-500"
                :class="project.completed ? 'border-cyan-400 bg-cyan-400/10' : 'border-fuchsia-500 bg-fuchsia-500/10'"
              >
                <img 
                  v-if="project.icon" 
                  :src="project.icon" 
                  :style="project.iconStyle"
                  alt="icon" 
                  class="w-8 h-8 sm:w-10 sm:h-10 object-contain ml-2 transition-all duration-300 animate-bounce-custom" 
                />
                <span v-else-if="project.completed" class="text-cyan-400 text-xl sm:text-2xl">✓</span>
                <span v-else class="text-fuchsia-400 text-xs sm:text-sm">{{ $t('SECTIONS.QUESTS.ACTIVE') }}</span>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <h3 class="text-base sm:text-lg md:text-xl font-bold break-words" :class="project.completed ? 'text-cyan-400' : 'text-fuchsia-400'">
                    {{ project.name }}
                  </h3>
                  <span class="px-2 py-0.5 text-[10px] sm:text-xs border whitespace-nowrap" :class="project.completed ? 'border-cyan-400/50 text-cyan-400' : 'border-fuchsia-500/50 text-fuchsia-400'">
                    {{ project.type }}
                  </span>
                </div>
                <p class="text-slate-400 text-xs sm:text-sm">{{ project.description }}</p>
              </div>

              <!-- XP Reward and Actions -->
              <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-4">
                <!-- XP Reward -->
                <div class="text-left sm:text-right shrink-0">
                  <div class="text-[10px] sm:text-xs text-slate-500">{{ $t('SECTIONS.QUESTS.REWARD') }}</div>
                  <div class="text-sm sm:text-lg font-bold text-fuchsia-400">+{{ project.xp }} XP</div>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-2 sm:gap-3 shrink-0">
                  <!-- View Demo button for completed projects -->
                  <!-- View Demo button for completed projects -->
                  <div v-if="project.platforms && project.platforms.length > 0" class="flex flex-wrap gap-2 justify-end">
                    <button
                      v-for="platform in project.platforms"
                      :key="platform.name"
                      @click.stop="openProjectDemo(platform.url)"
                      class="px-2 sm:px-3 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-[10px] sm:text-xs font-bold tracking-wider hover:from-cyan-500 hover:to-cyan-400 transition-all relative overflow-hidden group whitespace-nowrap flex items-center gap-2"
                      style="clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))"
                      :title="platform.name"
                    >
                      <img :src="platform.icon" class="w-3 h-3 sm:w-4 sm:h-4 platform-icon invert" :alt="platform.name" />
                      <span class="relative z-10 hidden md:inline">{{ platform.name }}</span>
                      <div class="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-cyan-400 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </button>
                  </div>
                  <button
                    v-else-if="project.completed && project.redirect"
                    @click.stop="openProjectDemo(project.redirect)"
                    class="px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-[10px] sm:text-xs font-bold tracking-wider hover:from-cyan-500 hover:to-cyan-400 transition-all relative overflow-hidden group whitespace-nowrap"
                    style="clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))"
                  >
                    <span class="relative z-10">{{ $t('SECTIONS.QUESTS.VIEW_DEMO') }}</span>
                    <div class="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-cyan-400 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Expanded content -->
            <div 
              v-show="expandedProject === index"
              class="px-6 pb-6 border-t border-slate-700/50"
            >
              <div class="pt-4 flex flex-wrap gap-2">
                <span 
                  v-for="tech in project.tech" 
                  :key="tech"
                  class="px-3 py-1 text-xs border border-cyan-400/30 text-cyan-400 bg-cyan-400/5"
                >
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Credentials Section -->
      <section id="credentials" class="max-w-6xl mx-auto py-12 sm:py-16 md:py-24">
        <div class="section-title flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center whitespace-nowrap">
            <span class="text-cyan-400">[</span>
            <img src="/icons/ui/smile-eyes-2.svg" class="w-6 h-6 sm:w-8 sm:h-8 inline-block mx-2 icon-fuchsia" alt="icon" />
            {{ $t('SECTIONS.CREDENTIALS.TITLE') }}
            <span class="text-cyan-400">]</span>
          </h2>
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        </div>

        <div class="space-y-6 sm:space-y-8">
          <!-- Education Section -->
          <div>
            <h3 class="text-base sm:text-lg font-bold text-fuchsia-400 mb-4 flex items-center gap-2">
              <span class="text-cyan-400">▸</span> {{ $t('SECTIONS.CREDENTIALS.EDUCATION') }}
            </h3>
            <div class="grid gap-4 sm:gap-6">
              <div
                v-for="(credential, index) in credentials.filter(c => c.type === 'DEGREE')"
                :key="index"
                class="credential-card border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm p-4 sm:p-6 hover:border-cyan-500/50 transition-all duration-300"
                style="clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))"
              >
                <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <!-- Icon or Image placeholder -->
                  <div class="shrink-0 w-16 h-16 sm:w-20 sm:h-20 border-2 border-cyan-400/50 bg-cyan-400/10 flex items-center justify-center text-2xl sm:text-3xl"
                       style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)">
                    <span v-if="!credential.image" class="text-cyan-400">🎓</span>
                    <img v-else :src="credential.image" :alt="credential.institution" class="w-full h-full object-contain" />
                  </div>

                  <div class="flex-1">
                    <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 class="text-base sm:text-lg font-bold text-cyan-400">{{ credential.title }}</h4>
                        <p class="text-xs sm:text-sm text-slate-300 mt-1">{{ credential.institution }}</p>
                      </div>
                      <span class="text-[10px] sm:text-xs text-slate-500 px-2 py-1 border border-slate-600/50 whitespace-nowrap">
                        {{ credential.period }}
                      </span>
                    </div>
                    <p class="text-xs sm:text-sm text-slate-400 mt-2">{{ credential.field }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Certifications Section -->
          <div>
            <h3 class="text-base sm:text-lg font-bold text-fuchsia-400 mb-4 flex items-center gap-2">
              <span class="text-cyan-400">▸</span> {{ $t('SECTIONS.CREDENTIALS.CERTIFICATIONS') }}
            </h3>
            <div class="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div
                v-for="(credential, index) in credentials.filter(c => c.type === 'CERTIFICATE')"
                :key="index"
                class="credential-card border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm p-4 sm:p-5 hover:border-fuchsia-500/50 transition-all duration-300"
                style="clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))"
              >
                <div class="flex flex-col gap-3">
                  <!-- Header with icon -->
                  <div class="flex items-start gap-3">
                    <div class="shrink-0 w-10 h-10 sm:w-12 sm:h-12 border border-fuchsia-500/50 bg-fuchsia-500/10 flex items-center justify-center"
                         style="clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)">
                      <span v-if="!credential.image" class="text-fuchsia-400 text-lg sm:text-xl">✓</span>
                      <img v-else :src="credential.image" :alt="credential.institution" class="w-full h-full object-contain" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm sm:text-base font-bold text-fuchsia-400 leading-tight line-clamp-2">{{ credential.title }}</h4>
                      <p class="text-xs text-slate-300 mt-1">{{ credential.institution }}</p>
                    </div>
                  </div>

                  <!-- Period and Credential ID -->
                  <div class="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                    <span class="text-slate-500 px-2 py-0.5 border border-slate-600/50">
                      {{ credential.period }}
                    </span>
                    <span v-if="credential.credentialId" class="text-cyan-400/70 font-mono">
                      {{ $t('SECTIONS.CREDENTIALS.ID') }}: {{ credential.credentialId }}
                    </span>
                  </div>

                  <!-- Skills if available -->
                  <div v-if="credential.skills" class="flex flex-wrap gap-1.5">
                    <span
                      v-for="skill in credential.skills"
                      :key="skill"
                      class="text-[10px] px-2 py-0.5 border border-cyan-400/30 text-cyan-400 bg-cyan-400/5"
                    >
                      {{ skill }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="connect" class="max-w-6xl mx-auto py-12 sm:py-16 md:py-24 pb-44 sm:pb-32">
        <div class="section-title flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center whitespace-nowrap">
            <span class="text-pink-400">[</span>
            <img src="/icons/ui/cat.svg" class="w-6 h-6 sm:w-8 sm:h-8 inline-block mx-2" alt="icon" />
            {{ $t('SECTIONS.CONNECT.TITLE') }}
            <span class="text-pink-400">]</span>
          </h2>
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
        </div>

        <!-- Social links grid -->
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <a
            v-for="link in socialLinks"
            :key="link.name"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="social-link flex flex-col items-center gap-3 sm:gap-4 p-6 sm:p-8 border border-slate-700/50 bg-slate-900/30 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 transition-all group relative"
            style="clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))"
          >
            <!-- Corner accent -->
            <div class="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-pink-500 to-fuchsia-500" style="clip-path: polygon(100% 0, 0 0, 100% 100%)" />

            <div class="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center border-2 border-cyan-400/50 bg-cyan-400/10 text-2xl sm:text-3xl group-hover:border-fuchsia-500/50 group-hover:bg-fuchsia-500/10 group-hover:scale-110 transition-all"
                 style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)">
              <img :src="link.icon" :alt="link.name" class="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div class="text-center">
              <div class="font-bold text-base sm:text-lg text-slate-100 group-hover:text-fuchsia-400 transition-colors mb-1">{{ link.name }}</div>
              <div class="text-[10px] sm:text-xs text-slate-500 group-hover:text-cyan-400 transition-colors break-all px-2">{{ link.handle }}</div>
            </div>
            <div class="text-slate-500 group-hover:text-fuchsia-400 group-hover:translate-x-1 transition-all text-xs sm:text-sm">&gt;&gt;</div>

            <!-- Hover glow -->
            <div class="absolute inset-0 bg-gradient-to-r from-fuchsia-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </section>
    </main>

    <!-- Footer HUD -->
    <footer class="fixed bottom-0 left-0 right-0 z-40 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-t from-slate-950 to-transparent">
      <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 text-[10px] sm:text-xs text-slate-500">
        <div class="flex items-center gap-2 sm:gap-4">
          <span class="text-fuchsia-400">◆</span>
          <span>{{ $t('FOOTER.SYSTEM') }}</span>
        </div>
        <div class="flex items-center gap-2 sm:gap-4">
          <span class="hidden sm:inline">{{ $t('FOOTER.CREDITS') }}: ∞</span>
          <span class="text-cyan-400 hidden sm:inline">|</span>
          <span class="text-center">{{ $t('FOOTER.BUILT_WITH') }} <span class="hidden sm:inline">VUE + TAILWIND</span><span class="sm:hidden">NUXT</span></span>
        </div>
        <div class="hidden sm:block">
           <a href="https://nucleoapp.com/app/" target="_blank" class="hover:text-cyan-400 transition-colors">{{ $t('FOOTER.ICONS_BY') }}</a>
           <span class="mx-2 text-slate-700">|</span>
           <a href="https://www.youtube.com/@FreeMusicc" target="_blank" class="hover:text-fuchsia-400 transition-colors">{{ $t('FOOTER.MUSIC_BY') }}</a>
        </div>
      </div>
    </footer>

    <!-- Music Player HUD -->
    <div class="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <!-- Toggle Button -->
      <button 
        @click="isPlayerOpen = !isPlayerOpen"
        class="w-10 h-10 flex items-center justify-center bg-slate-900/90 border border-cyan-400/50 rounded-full hover:bg-cyan-400/20 transition-all duration-300"
      >
        <span class="text-xl animate-pulse" v-if="isPlaying">🎵</span>
        <span class="text-xl" v-else>🔇</span>
      </button>

      <!-- Expanded Player -->
      <transition 
        enter-active-class="transform transition ease-out duration-300"
        enter-from-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transform transition ease-in duration-200"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-4 opacity-0"
      >
        <div 
          v-if="isPlayerOpen"
          class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-3 bg-slate-900/90 border border-fuchsia-500/50 backdrop-blur-md w-40 sm:w-auto transition-all"
          style="clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
        >
          <!-- Visualizer Bars (Animated) -->
          <div class="flex items-end gap-1 h-4">
            <div class="w-1 bg-cyan-400 animate-pulse" :style="{ height: isPlaying ? '100%' : '20%', animationDuration: '0.4s' }" />
            <div class="w-1 bg-fuchsia-400 animate-pulse" :style="{ height: isPlaying ? '60%' : '20%', animationDuration: '0.6s' }" />
            <div class="w-1 bg-cyan-400 animate-pulse" :style="{ height: isPlaying ? '80%' : '20%', animationDuration: '0.3s' }" />
            <div class="w-1 bg-fuchsia-400 animate-pulse" :style="{ height: isPlaying ? '40%' : '20%', animationDuration: '0.5s' }" />
          </div>

          <div class="flex flex-col items-center sm:items-start text-center sm:text-left overflow-hidden w-full sm:w-auto">
             <span class="text-[10px] text-cyan-400 font-bold tracking-wider w-full truncate">
               {{ tracks[currentTrackIndex].name }}
             </span>
             <span class="text-[8px] text-fuchsia-400">
               {{ isPlaying ? $t('MUSIC_PLAYER.PLAYING') : $t('MUSIC_PLAYER.PAUSED') }}
             </span>
          </div>

          <div class="flex items-center gap-2">
            <button @click="togglePlay" class="w-8 h-8 flex items-center justify-center border border-slate-600 hover:border-cyan-400 hover:text-cyan-400 transition-colors">
              <span v-if="!isPlaying">▶</span>
              <span v-else>❚❚</span>
            </button>
            <button @click="nextTrack" class="w-8 h-8 flex items-center justify-center border border-slate-600 hover:border-fuchsia-400 hover:text-fuchsia-400 transition-colors">
              ⏭
            </button>
          </div>
          
          <!-- Volume Control -->
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            v-model="volume"
            @input="updateVolume"
            class="w-full sm:w-16 accent-cyan-400"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n } from 'vue-i18n'

import { Howl, Howler } from 'howler'

// Register GSAP plugins
if (process.client) {
  gsap.registerPlugin(ScrollTrigger)
}

useHead({
  title: 'Pablo Cabrera - Full Stack Developer',
  meta: [
    { name: 'description', content: 'Pablo Cabrera - Full Stack Developer specializing in Vue.js, React, Django, and modern web technologies. Professional portfolio.' }
  ]
})

const { locale, setLocale } = useI18n()

const navItems = ['HOME', 'WORK', 'SKILLS', 'QUESTS', 'CREDENTIALS', 'CONNECT']
const activeSection = ref('home')
const activeSkill = ref(null)
const activeCompany = ref(null)
const expandedProject = ref(null)
const glitching = ref(false)
const scrollY = ref(0)
const health = ref(100)
const mobileMenuOpen = ref(false)

const displayedName = ref('')
const fullName = 'PABLO CABRERA'
const projectInterval = ref(null)

// Music Player State
const isPlayerOpen = ref(false)
const isPlaying = ref(false)
const currentTrackIndex = ref(0)
const volume = ref(0.2) // Start at 20%
const sound = ref(null)

// Navbar State
const isNavVisible = ref(true)
const lastScrollPosition = ref(0)
const tracks = [
  { name: 'AdhesiveWombat - Night Shade', path: '/music/AdhesiveWombat - Night Shade.mp3' },
  { name: 'Jeremy Blake - Powerup!', path: '/music/Jeremy Blake - Powerup!.mp3' },
  { name: 'Kevin MacLeod - 8bit Dungeon Boss', path: '/music/Kevin MacLeod - 8bit Dungeon Boss.mp3' }
]

const initAudio = () => {
    sound.value = new Howl({
      src: [tracks[currentTrackIndex.value].path],
      html5: true,
      volume: volume.value,
      onend: () => {
        nextTrack()
      }
    })
  }

const stats = [
  { label: 'PROJECTS', value: '50+', icon: '/icons/ui/calendar.svg' },
  // { label: 'COMMITS', value: '2.5K' },
  { label: 'COFFEE', value: '∞', icon: '/icons/ui/smile.svg' }
]

const companies = [
  {
    name: 'DOKITPRO',
    role: 'Programador Fullstack',
    period: 'Feb 2024 - Actualidad',
    logo: '/images/dokitpro.png',
    tech: ['Vue3', 'Django', 'Frontend']
  },
  {
    name: 'ALLUXI',
    role: 'Programadora Full Stack',
    period: 'Jun 2022 - Sept 2024',
    logo: '/images/alluxi.png',
    tech: ['Django', 'Vue.js', 'Nuxt', 'React', 'React Native', '.NET']
  },
  {
    name: 'I20VEINTE',
    role: 'Web Developer',
    period: 'Nov 2021 - May 2022',
    logo: '/images/i20veinte.png',
    tech: ['PHP', 'React.js', 'NestJS', 'Node.js', 'WordPress']
  }
]

const skills = [
  { name: 'JAVASCRIPT', icon: '/icons/javascript.svg', level: 95 },
  { name: 'VUE.JS', icon: '/icons/vuedotjs.svg', level: 90 },
  { name: 'REACT', icon: '/icons/react.svg', level: 85 },
  { name: 'NODE.JS', icon: '/icons/nodedotjs.svg', level: 88 },
  { name: 'PYTHON', icon: '/icons/python.svg', level: 80 },
  { name: 'FLASK', icon: '/icons/flask.svg', level: 80 },
  { name: 'DJANGO', icon: '/icons/django.svg', level: 85 },
  { name: 'NEXT', icon: '/icons/nextdotjs.svg', level: 88 },
  { name: 'NUXT', icon: '/icons/nuxt.svg', level: 88 },
  { name: 'MYSQL', icon: '/icons/mysql.svg', level: 75 },
  { name: 'MONGODB', icon: '/icons/mongodb.svg', level: 70 },
  { name: 'DOCKER', icon: '/icons/docker.svg', level: 50 }
]

const uiIcons = [
  'boot.svg',
  'calendar.svg',
  'cat.svg',
  'cyborg.svg',
  'face-disappointed.svg',
  'face-grin.svg',
  'football-helmet.svg',
  'ghost.svg',
  'hammer.svg',
  'question-mark.svg',
  'robot-2.svg',
  'smile-eyes-2.svg',
  'smile.svg',
  'user-2.svg',
  'winter-glove.svg'
]

const projects = ref([
  {
    name: 'PORTAFOLIO_2026',
    type: 'MAIN_QUEST',
    description: 'Portfolio page for my presentations',
    tech: ['Nuxtjs', 'TailwindCSS'],
    xp: 1000,
    completed: true,
    redirect: '/',
    icon: null,
    iconStyle: {},
    opacity: 1
  },
  {
    name: 'CATALOG_MAKER',
    type: 'SIDE_QUEST',
    description: 'Product catalog creation and management platform',
    tech: ['Nuxtjs', 'TailwindCSS'],
    xp: 750,
    completed: true,
    redirect: 'https://monitor.pablocabrera.dev/',
    icon: null,
    iconStyle: {},
    opacity: 1
  },
  {
    name: 'ECOMMERCE_DEMO_FRONTEND',
    type: 'SIDE_QUEST',
    description: 'Ecommerce demo frontend',
    tech: ['Nuxtjs', 'TailwindCSS'],
    xp: 1000,
    completed: true,
    redirect: 'https://store.pablocabrera.dev/',
    icon: null,
    iconStyle: {},
    opacity: 1
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
      { name: 'Linux', icon: '/icons/os/linux.svg', url: 'https://github.com/Mrroboto9819/FlowStack-desktop/releases/latest/download/FlowStack_4.0.1_amd64.deb' },
      { name: 'macOS', icon: '/icons/os/apple.svg', url: 'https://github.com/Mrroboto9819/FlowStack-desktop/releases/latest/download/FlowStack_4.0.1_aarch64.dmg' }
    ],
    icon: null,
    iconStyle: {},
    opacity: 1
  },
  // {
  //   name: 'ECOMMERCE_DEMO_BACKEND',
  //   type: 'SIDE_QUEST',
  //   description: 'Demo of api server admin in Django',
  //   tech: ['DJANGO', 'POSTGRESQL'],
  //   xp: 1500,
  //   completed: true,
  //   redirect: 'https://store-api.pablocabrera.dev/admin/login/',
  //   icon: null,
  //   iconStyle: {},
  //   opacity: 1
  // }
])

const socialLinks = [
  {
    name: 'GITHUB',
    icon: '/icons/ui/github.svg',
    handle: '@Mrroboto9819',
    url: 'https://github.com/Mrroboto9819'
  },
  {
    name: 'LINKEDIN',
    icon: '/icons/ui/linkedin.svg',
    handle: 'pablo-cabrera-castrejon',
    url: 'https://www.linkedin.com/in/pablo-cabrera-castrejon/'
  },
  {
    name: 'EMAIL',
    icon: '/icons/ui/envelope-fill-24.svg',
    handle: 'pablo.cabrera.castrejon@gmail.com',
    url: 'mailto:pablo.cabrera.castrejon@gmail.com'
  }
]

const credentials = [
  {
    type: 'DEGREE',
    title: 'Ingeniería en Sistemas Computacionales',
    institution: 'Universidad del Valle de México',
    period: 'JUN 2018 - DEC 2022',
    field: 'Desarrollo de aplicaciones web',
    image: null
  },
  {
    type: 'CERTIFICATE',
    title: 'Working with Data',
    institution: 'Meta',
    period: 'JAN 2026',
    skills: ['SQL', 'JSON', 'APIs'],
    credentialId: 'QLM16WJACL1R',
    image: '/images/certs/meta_logo.png'
  },
  {
    type: 'CERTIFICATE',
    title: 'Continuous Integration & Continuous Deployment with Jenkins',
    institution: 'LearnKartS',
    period: 'MAY 2025',
    credentialId: 'N32R63CR6U8W',
    skills: ['CI/CD', 'Jenkins'],
    image: '/images/certs/learnkarts_logo.png'
  },
  {
    type: 'CERTIFICATE',
    title: 'DevOps and Jenkins Fundamentals',
    institution: 'LearnKartS',
    period: 'MAY 2025',
    skills: ['DevOps', 'Jenkins'],
    credentialId: '6D9VKRZQ2K6K',
    image: '/images/certs/learnkarts_logo.png'
  },
  {
    type: 'CERTIFICATE',
    title: 'Django Application Development with SQL and Databases',
    institution: 'IBM',
    period: 'JAN 2024',
    credentialId: 'EDVQ9GMKGZCG',
    skills: ['Django', 'SQL', 'Databases'],
    image: '/images/certs/ibm_logo.jpg'
  },
  {
    type: 'CERTIFICATE',
    title: 'Python for Data Science, AI & Development',
    institution: 'IBM',
    period: 'JAN 2024',
    credentialId: '65RCXR2AFP5K',
    skills: ['Python'],
    image: '/images/certs/ibm_logo.jpg'
  },
  {
    type: 'CERTIFICATE',
    title: 'Introduction to Web Development with HTML, CSS, JavaScript',
    institution: 'IBM',
    period: 'JAN 2024',
    credentialId: 'WWAEGLJMJV7D',
    skills: ['HTML5', 'CSS', 'JavaScript'],
    image: '/images/certs/ibm_logo.jpg'
  },
  {
    type: 'CERTIFICATE',
    title: 'Version Control',
    institution: 'Meta',
    period: 'NOV 2024',
    skills: ['Git', 'GitHub', 'GitLabs'],
    credentialId: 'LPZF8LWB4K2K',
    image: '/images/certs/meta_logo.png'
  },
  {
    type: 'CERTIFICATE',
    title: 'Programming with JavaScript',
    institution: 'Meta',
    period: 'NOV 2024',
    skills: ['JavaScript', 'HTML5', 'CSS'],
    credentialId: '1JO6B9UW2MTE',
    image: '/images/certs/meta_logo.png'
  },
  {
    type: 'CERTIFICATE',
    title: 'React Basics',
    institution: 'Meta',
    period: 'NOV 2024',
    skills: ['React', 'JavaScript', 'HTML5', 'CSS'],
    credentialId: 'WYDPPD1X5E7A',
    image: '/images/certs/meta_logo.png'
  },
  {
    type: 'CERTIFICATE',
    title: 'Introduction to Mobile Development',
    institution: 'Meta',
    period: 'NOV 2024',
    skills: ['React Native', 'Android Studio', 'iOS'],
    credentialId: 'BY5NCO4NL97L',
    image: '/images/certs/meta_logo.png'
  },
  {
    type: 'CERTIFICATE',
    title: 'React Native',
    institution: 'Meta',
    period: 'NOV 2023',
    skills: ['React Native'],
    credentialId: '3VJTVXZAS04W',
    image: '/images/certs/meta_logo.png'
  }
]

const hoverSound = () => {
  glitching.value = true
  setTimeout(() => glitching.value = false, 150)
}

const typeWriter = () => {
  let i = 0
  const interval = setInterval(() => {
    if (i < fullName.length) {
      displayedName.value = fullName.slice(0, i + 1)
      i++
    } else {
      clearInterval(interval)
    }
  }, 100)
}

const scrollToSection = (section) => {
  activeSection.value = section
  const element = document.getElementById(section)
  if (element) {
    const offset = 80 // Account for fixed nav
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

const openProjectDemo = (redirect) => {
  if (redirect.startsWith('http')) {
    window.open(redirect, '_blank')
  } else {
    window.location.href = redirect
  }
}

  const updateVolume = () => {
    if (sound.value) {
      sound.value.volume(volume.value)
    }
  }

  const togglePlay = () => {
    if (!sound.value) return
    
    if (isPlaying.value) {
      sound.value.pause()
    } else {
      sound.value.play()
    }
    isPlaying.value = !isPlaying.value
  }

  const nextTrack = () => {
    if (sound.value) {
       sound.value.stop()
       sound.value.unload()
    }
    
    currentTrackIndex.value = (currentTrackIndex.value + 1) % tracks.length
    
    // Slight delay to ensure clean transition
    setTimeout(() => {
        initAudio()
        sound.value.play()
        isPlaying.value = true
    }, 100)
  }


const handleScroll = () => {
  const currentScrollPosition = window.scrollY
  
  // Auto-hide navbar logic
  if (currentScrollPosition < lastScrollPosition.value || currentScrollPosition < 50) {
    isNavVisible.value = true
  } else if (currentScrollPosition > lastScrollPosition.value && currentScrollPosition > 300) {
    isNavVisible.value = false
  }
  lastScrollPosition.value = currentScrollPosition

  scrollY.value = window.scrollY

  // Update active section based on scroll position
  const sections = ['home', 'work', 'skills', 'quests', 'credentials', 'connect']
  const scrollPosition = window.scrollY + 150 // Offset for navbar

  // Check if we're at the bottom of the page
  const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50

  // If at bottom, activate the last section
  if (isAtBottom) {
    activeSection.value = sections[sections.length - 1]
    return
  }

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(sections[i])
    if (section && section.offsetTop <= scrollPosition) {
      activeSection.value = sections[i]
      break
    }
  }
}

onMounted(() => {
  typeWriter()
  window.addEventListener('scroll', handleScroll)

  // Initialize and animate project icons
  const randomizeProjectIcons = () => {
    projects.value.forEach(project => {
      const randomIcon = uiIcons[Math.floor(Math.random() * uiIcons.length)]
      project.icon = `/icons/ui/${randomIcon}`
      
      // Toggle between Cyan and Fuchsia filters
      const isCyan = Math.random() > 0.5
      
      const cyanFilter = 'brightness(0) saturate(100%) invert(73%) sepia(55%) saturate(458%) hue-rotate(142deg) brightness(97%) contrast(92%)'
      const fuchsiaFilter = 'brightness(0) saturate(100%) invert(57%) sepia(89%) saturate(6373%) hue-rotate(290deg) brightness(101%) contrast(101%)'
      
      project.iconStyle = {
        filter: isCyan ? cyanFilter : fuchsiaFilter
      }
    })
  }

  randomizeProjectIcons()
  projectInterval.value = setInterval(randomizeProjectIcons, 1000)



  // Initialize audio but don't play yet (browser policy)
  initAudio()





  // GSAP Animations
  if (process.client) {
    // Hero section entrance animations
    gsap.from('.hero-status', {
      opacity: 0,
      x: -50,
      duration: 0.8,
      ease: 'power3.out'
    })

    gsap.from('.hero-title', {
      opacity: 0,
      y: 30,
      duration: 1,
      delay: 0.3,
      ease: 'power3.out'
    })

    gsap.from('.hero-stats > div', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.6,
      ease: 'power2.out'
    })

    gsap.from('.hero-buttons > button', {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.9,
      ease: 'back.out(1.7)'
    })

    gsap.from('.hero-avatar', {
      opacity: 0,
      scale: 0.8,
      rotation: -10,
      duration: 1.2,
      delay: 0.5,
      ease: 'elastic.out(1, 0.5)'
    })

    // Scroll-triggered animations for sections
    gsap.utils.toArray('.section-title').forEach((title) => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        ease: 'power2.out'
      })
    })

    // XP bars animation for skills
    gsap.utils.toArray('.xp-bar-fill').forEach((bar) => {
      gsap.from(bar, {
        scrollTrigger: {
          trigger: bar,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        width: '0%',
        duration: 1.2,
        ease: 'power2.out'
      })
    })

    // Work history cards animation
    gsap.utils.toArray('.work-card').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        rotation: index % 2 === 0 ? -5 : 5,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power3.out'
      })
    })

    // Skills cards animation
    gsap.utils.toArray('.skill-card').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        delay: index * 0.05,
        ease: 'back.out(1.7)'
      })
    })

    // Quest cards animation
    gsap.utils.toArray('.quest-card').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: index % 2 === 0 ? -50 : 50,
        duration: 0.8,
        ease: 'power3.out'
      })
    })

    // Credential cards animation
    gsap.utils.toArray('.credential-card').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: index * 0.08,
        ease: 'power2.out'
      })
    })

    // Social links animation
    gsap.utils.toArray('.social-link').forEach((link, index) => {
      gsap.from(link, {
        scrollTrigger: {
          trigger: link,
          start: 'top 95%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 30,
        rotation: 10,
        duration: 0.6,
        delay: index * 0.1,
        ease: 'back.out(1.7)'
      })
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (projectInterval.value) clearInterval(projectInterval.value)

  // Clean up GSAP ScrollTriggers
  if (process.client) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill())
  }
})
</script>

<style>
@keyframes spin-slow {
  from { transform: rotate(45deg); }
  to { transform: rotate(405deg); }
}
@keyframes spin-slow-reverse {
  from { transform: rotate(45deg); }
  to { transform: rotate(-315deg); }
}
.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}
.animate-spin-slow-reverse {
  animation: spin-slow-reverse 15s linear infinite;
}
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}
.animate-glitch {
  animation: glitch 0.15s ease-in-out;
}

/* Style SVG icons with cyberpunk colors */
img[src$='.svg']:not(.flag-icon):not(.platform-icon) {
  filter: brightness(0) saturate(100%) invert(73%) sepia(55%) saturate(458%) hue-rotate(142deg) brightness(97%) contrast(92%);
  transition: filter 0.3s ease;
}

.group:hover img[src$='.svg']:not(.flag-icon):not(.platform-icon) {
  filter: brightness(0) saturate(100%) invert(57%) sepia(89%) saturate(6373%) hue-rotate(290deg) brightness(101%) contrast(101%);
}

.icon-fuchsia {
  filter: brightness(0) saturate(100%) invert(57%) sepia(89%) saturate(6373%) hue-rotate(290deg) brightness(101%) contrast(101%) !important;
}

@keyframes bounce-custom {
  /* 0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-25%); } */
}
.animate-bounce-custom {
  animation: bounce-custom 2s infinite ease-in-out;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #0f172a; /* slate-900 */
}
::-webkit-scrollbar-thumb {
  background: #06b6d4; /* cyan-500 */
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #d946ef; /* fuchsia-500 */
}

/* Custom Cursor */
/* * {
  cursor: url('/icons/ui/mouse/cursor-custom.svg'), auto !important;
} */
</style>