<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-mono overflow-hidden relative flex items-center justify-center">
    <!-- Animated grid background -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div
        class="absolute inset-0 opacity-20"
        :style="{
          backgroundImage: 'linear-gradient(to right, #f0abfc 1px, transparent 1px), linear-gradient(to bottom, #f0abfc 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center top'
        }"
      />
    </div>

    <!-- Scanlines overlay -->
    <div 
      class="fixed inset-0 pointer-events-none z-50 opacity-5"
      :style="{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
      }"
    />

    <div class="relative z-10 text-center space-y-8 p-6 max-w-lg">
      <div class="relative inline-block">
        <div class="absolute -inset-4 bg-fuchsia-500/20 blur-xl animate-pulse" />
        <h1 class="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-fuchsia-500 relative z-10">
          404
        </h1>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-center gap-2 text-fuchsia-400">
          <span class="animate-ping">●</span>
          <span class="tracking-[0.2em] font-bold">SYSTEM ERROR</span>
          <span class="animate-ping">●</span>
        </div>
        
        <p class="text-slate-400 text-lg sm:text-xl">
          THE REQUESTED RESOURCE COULD NOT BE LOCATED IN THE MAIN FRAME.
        </p>
      </div>

      <div class="pt-8">
        <button
          @click="handleError"
          class="group relative px-8 py-4 bg-slate-900 overflow-hidden transition-all duration-300 hover:-translate-y-1"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-fuchsia-500 opacity-20 group-hover:opacity-30 transition-opacity" />
          <div class="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-400 to-fuchsia-500" />
          <div class="relative flex items-center gap-3">
            <span class="text-cyan-400 group-hover:text-white transition-colors">RETURN TO MISSION CONTROL</span>
            <span class="text-fuchsia-500 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => {
  clearError({ redirect: '/' })
}
</script>
