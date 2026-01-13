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
      <!-- Glow orbs -->
      <div class="absolute top-20 left-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" />
      <div class="absolute bottom-40 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s" />
    </div>

    <!-- Scanlines overlay -->
    <div 
      class="fixed inset-0 pointer-events-none z-50 opacity-5"
      :style="{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
      }"
    />

    <!-- Navigation HUD -->
    <nav class="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-4 bg-slate-950/80 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-fuchsia-500 animate-pulse" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" />
          <span class="text-fuchsia-400 text-xs sm:text-sm tracking-widest">PLAYER_01</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-4 lg:gap-6">
          <button
            v-for="(item, index) in navItems"
            :key="item"
            @click="scrollToSection(item.toLowerCase())"
            class="relative px-3 lg:px-4 py-2 text-xs tracking-wider transition-all duration-300 group"
            :class="activeSection === item.toLowerCase() ? 'text-cyan-400' : 'text-slate-400 hover:text-fuchsia-400'"
          >
            <span class="relative z-10">{{ item }}</span>
            <div
              v-if="activeSection === item.toLowerCase()"
              class="absolute inset-0 border border-cyan-400/50 bg-cyan-400/10"
              style="clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))"
            />
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 text-cyan-400 hover:text-fuchsia-400 transition-colors"
        >
          <div class="w-6 h-5 flex flex-col justify-between">
            <span class="w-full h-0.5 bg-current transition-all" :class="mobileMenuOpen ? 'rotate-45 translate-y-2' : ''" />
            <span class="w-full h-0.5 bg-current transition-all" :class="mobileMenuOpen ? 'opacity-0' : ''" />
            <span class="w-full h-0.5 bg-current transition-all" :class="mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''" />
          </div>
        </button>

        <div class="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <span>LVL</span>
          <span class="text-cyan-400 font-bold">42</span>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div
        v-show="mobileMenuOpen"
        class="md:hidden mt-4 border-t border-slate-700/50 pt-4"
      >
        <div class="flex flex-col gap-2">
          <button
            v-for="(item, index) in navItems"
            :key="item"
            @click="scrollToSection(item.toLowerCase()); mobileMenuOpen = false"
            class="relative px-4 py-3 text-left text-sm tracking-wider transition-all duration-300"
            :class="activeSection === item.toLowerCase() ? 'text-cyan-400 bg-cyan-400/10 border-l-2 border-cyan-400' : 'text-slate-400 hover:text-fuchsia-400 hover:bg-fuchsia-400/5'"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="relative z-10 pt-20 sm:pt-24 px-4 sm:px-6">
      <!-- Hero Section -->
      <section id="home" class="max-w-6xl mx-auto min-h-screen flex items-center py-12 sm:py-0">
        <div class="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center w-full">
          <div class="space-y-6 sm:space-y-8">
            <!-- Status indicator -->
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              <span class="text-cyan-400 text-xs tracking-widest">SYSTEM ONLINE</span>
            </div>

            <!-- Main title with glitch effect -->
            <div class="space-y-2">
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
                SOFTWARE_ENGINEER
                <span class="text-cyan-400">/&gt;</span>
              </p>
            </div>

            <!-- Stats HUD -->
            <div class="grid grid-cols-3 gap-2 sm:gap-4">
              <div
                v-for="stat in stats"
                :key="stat.label"
                class="p-2 sm:p-4 border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm relative overflow-hidden group hover:border-fuchsia-500/50 transition-colors"
                style="clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div class="text-lg sm:text-2xl font-bold text-fuchsia-400">{{ stat.value }}</div>
                <div class="text-[10px] sm:text-xs text-slate-500 tracking-wider">{{ stat.label }}</div>
              </div>
            </div>

            <!-- CTA buttons -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                @mouseenter="hoverSound"
                @click="scrollToSection('work')"
                class="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white text-sm sm:text-base font-bold tracking-wider relative overflow-hidden group cursor-pointer"
                style="clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))"
              >
                <span class="relative z-10">START_GAME</span>
                <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-fuchsia-500 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </button>
              <button
                @click="scrollToSection('skills')"
                class="px-6 sm:px-8 py-3 sm:py-4 border border-cyan-400/50 text-cyan-400 text-sm sm:text-base font-bold tracking-wider hover:bg-cyan-400/10 transition-colors cursor-pointer"
                style="clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))"
              >
                VIEW_STATS
              </button>
            </div>
          </div>

          <!-- Character display -->
          <div class="relative flex items-center justify-center mt-8 lg:mt-0">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 border border-fuchsia-500/30 rotate-45 animate-spin-slow" />
              <div class="absolute w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 border border-cyan-400/30 rotate-45 animate-spin-slow-reverse" />
            </div>

            <!-- Character avatar -->
            <div class="relative z-10 p-4 sm:p-8">
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
                  <span class="text-fuchsia-400">HP</span>
                  <span class="text-slate-400">{{ health }}/100</span>
                </div>
                <div class="h-2 bg-slate-800 overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-fuchsia-600 to-pink-500 transition-all duration-500"
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
        <div class="flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center whitespace-nowrap">
            <span class="text-cyan-400">[</span>
            WORK_HISTORY
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
            class="p-6 border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm relative overflow-hidden group cursor-pointer transition-all duration-300"
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
        <div class="flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center whitespace-nowrap">
            <span class="text-fuchsia-400">[</span>
            SKILL_TREE
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
            class="p-3 sm:p-4 md:p-6 border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm relative overflow-hidden group cursor-pointer transition-all duration-300"
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
                <span class="text-slate-500">XP</span>
                <span class="text-cyan-400">{{ skill.level }}/100</span>
              </div>
              <div class="h-1.5 bg-slate-800 overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-1000"
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
        <div class="flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center whitespace-nowrap">
            <span class="text-cyan-400">[</span>
            QUEST_LOG
            <span class="text-cyan-400">]</span>
          </h2>
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        </div>

        <!-- Instructions -->
        <div class="mb-6 sm:mb-8 p-3 sm:p-4 border border-cyan-400/30 bg-cyan-400/5 text-center">
          <p class="text-xs sm:text-sm text-cyan-400">
            <span class="text-fuchsia-400">▸</span> <span class="hidden sm:inline">Click "VIEW DEMO" to see live projects or expand to view tech stack</span><span class="sm:hidden">Tap "VIEW DEMO" or expand for details</span> <span class="text-fuchsia-400">◂</span>
          </p>
        </div>

        <div class="space-y-4 sm:space-y-6">
          <div
            v-for="(project, index) in projects"
            :key="project.name"
            class="border border-slate-700/50 bg-slate-900/30 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-fuchsia-500/50"
            style="clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))"
          >
            <div class="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <!-- Quest status -->
              <div
                class="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center border-2 shrink-0"
                :class="project.completed ? 'border-cyan-400 bg-cyan-400/10' : 'border-fuchsia-500 bg-fuchsia-500/10'"
              >
                <span v-if="project.completed" class="text-cyan-400 text-xl sm:text-2xl">✓</span>
                <span v-else class="text-fuchsia-400 text-xs sm:text-sm">ACTIVE</span>
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
                  <div class="text-[10px] sm:text-xs text-slate-500">REWARD</div>
                  <div class="text-sm sm:text-lg font-bold text-fuchsia-400">+{{ project.xp }} XP</div>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-2 sm:gap-3 shrink-0">
                  <!-- View Demo button for completed projects -->
                  <button
                    v-if="project.completed && project.redirect"
                    @click.stop="openProjectDemo(project.redirect)"
                    class="px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-[10px] sm:text-xs font-bold tracking-wider hover:from-cyan-500 hover:to-cyan-400 transition-all relative overflow-hidden group whitespace-nowrap"
                    style="clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))"
                  >
                    <span class="relative z-10">VIEW DEMO</span>
                    <div class="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-cyan-400 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  </button>

                  <!-- Expand arrow -->
                  <button
                    @click.stop="expandedProject = expandedProject === index ? null : index"
                    class="text-slate-500 hover:text-cyan-400 transition-all duration-300 p-1 sm:p-2"
                    :class="expandedProject === index ? 'rotate-180' : ''"
                  >
                    ▼
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

      <!-- Contact Section -->
      <section id="connect" class="max-w-6xl mx-auto py-12 sm:py-16 md:py-24 pb-24 sm:pb-32">
        <div class="flex items-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center whitespace-nowrap">
            <span class="text-pink-400">[</span>
            CONNECT
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
            class="flex flex-col items-center gap-3 sm:gap-4 p-6 sm:p-8 border border-slate-700/50 bg-slate-900/30 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 transition-all group relative"
            style="clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))"
          >
            <!-- Corner accent -->
            <div class="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-pink-500 to-fuchsia-500" style="clip-path: polygon(100% 0, 0 0, 100% 100%)" />

            <div class="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center border-2 border-cyan-400/50 bg-cyan-400/10 text-2xl sm:text-3xl group-hover:border-fuchsia-500/50 group-hover:bg-fuchsia-500/10 group-hover:scale-110 transition-all"
                 style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)">
              {{ link.icon }}
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
          <span>SYSTEM v2.0.26</span>
        </div>
        <div class="flex items-center gap-2 sm:gap-4">
          <span class="hidden sm:inline">CREDITS: ∞</span>
          <span class="text-cyan-400 hidden sm:inline">|</span>
          <span class="text-center">BUILT WITH <span class="hidden sm:inline">VUE + TAILWIND</span><span class="sm:hidden">NUXT</span></span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

useHead({
  title: 'Pablo Cabrera - Full Stack Developer',
  meta: [
    { name: 'description', content: 'Pablo Cabrera - Full Stack Developer specializing in Vue.js, React, Django, and modern web technologies. Professional portfolio.' }
  ]
})

const navItems = ['HOME', 'WORK', 'SKILLS', 'QUESTS', 'CONNECT']
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

const stats = [
  { label: 'PROJECTS', value: '50+' },
  // { label: 'COMMITS', value: '2.5K' },
  { label: 'COFFEE', value: '∞' }
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
  { name: 'DJANGO', icon: '/icons/django.svg', level: 85 },
  { name: 'NUXT', icon: '/icons/nuxt.svg', level: 88 },
  { name: 'MYSQL', icon: '/icons/mysql.svg', level: 75 },
  { name: 'MONGODB', icon: '/icons/mongodb.svg', level: 70 },
  { name: 'DOCKER', icon: '/icons/docker.svg', level: 50 }
]

const projects = [
  {
    name: 'PORTAFOLIO_2026',
    type: 'MAIN_QUEST',
    description: 'Portfolio page for my presentations',
    tech: ['Nuxtjs', 'TailwindCSS'],
    xp: 1000,
    completed: true,
    redirect: '/'
  },
  {
    name: 'CATALOG_MONITOR',
    type: 'SIDE_QUEST',
    description: 'Product catalog creation and management platform',
    tech: ['Nuxtjs', 'TailwindCSS'],
    xp: 750,
    completed: true,
    redirect: 'https://monitor.pablocabrera.dev/'
  }
]

const socialLinks = [
  {
    name: 'GITHUB',
    icon: '⬡',
    handle: '@Mrroboto9819',
    url: 'https://github.com/Mrroboto9819'
  },
  {
    name: 'LINKEDIN',
    icon: '◈',
    handle: 'pablo-cabrera-castrejon',
    url: 'https://www.linkedin.com/in/pablo-cabrera-castrejon/'
  },
  {
    name: 'EMAIL',
    icon: '✉',
    handle: 'pablo.cabrera.castrejon@gmail.com',
    url: 'mailto:pablo.cabrera.castrejon@gmail.com'
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

const handleScroll = () => {
  scrollY.value = window.scrollY
}

onMounted(() => {
  typeWriter()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
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
img[src$='.svg'] {
  filter: brightness(0) saturate(100%) invert(73%) sepia(55%) saturate(458%) hue-rotate(142deg) brightness(97%) contrast(92%);
  transition: filter 0.3s ease;
}

.group:hover img[src$='.svg'] {
  filter: brightness(0) saturate(100%) invert(57%) sepia(89%) saturate(6373%) hue-rotate(290deg) brightness(101%) contrast(101%);
}
</style>