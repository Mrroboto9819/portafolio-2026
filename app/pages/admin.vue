<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-mono flex items-center justify-center relative overflow-hidden">
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div
        class="absolute inset-0 opacity-10"
        :style="{
          backgroundImage: 'linear-gradient(to right, #f0abfc 1px, transparent 1px), linear-gradient(to bottom, #f0abfc 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }"
      />
      <div class="absolute top-1/4 left-1/3 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" />
      <div class="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s" />
    </div>

    <div
      class="fixed inset-0 pointer-events-none z-50 opacity-5"
      :style="{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }"
    />

    <div
      class="relative z-10 w-full max-w-md mx-4 p-8 border border-slate-700/80 bg-slate-900/60 backdrop-blur-sm"
      style="clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))"
    >
      <div class="absolute top-0 right-0 w-5 h-5 bg-gradient-to-br from-cyan-500 to-fuchsia-500" style="clip-path: polygon(100% 0, 0 0, 100% 100%)" />

      <div v-if="isCheckingSession" class="text-center">
        <h1 class="text-fuchsia-400 text-sm tracking-widest uppercase">Checking Session</h1>
        <p class="mt-3 text-xs text-slate-400 tracking-wide">Please wait...</p>
      </div>

      <form v-else-if="!isAuthorized" class="space-y-5" @submit.prevent="unlock">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 bg-fuchsia-500 animate-pulse" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" />
          <h1 class="text-fuchsia-400 text-sm tracking-widest uppercase">Admin Access Required</h1>
        </div>

        <p class="text-xs text-slate-400 tracking-wide">
          Enter the admin password to unlock this view.
        </p>

        <label class="block">
          <span class="text-xs text-slate-500 tracking-wider uppercase">Password</span>
          <input
            v-model="passwordInput"
            type="password"
            autocomplete="current-password"
            class="mt-2 w-full px-3 py-2 bg-slate-950 border border-slate-700 text-cyan-300 focus:outline-none focus:border-cyan-400"
            placeholder="ADMIN_PASSWORD"
          >
        </label>

        <p v-if="authError" class="text-xs text-red-400 tracking-wide">{{ authError }}</p>

        <button
          type="submit"
          class="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-xs tracking-widest uppercase hover:bg-cyan-500/30 transition"
        >
          Unlock Admin
        </button>
      </form>

      <template v-else>
        <div class="flex items-center gap-3 mb-8">
          <div class="w-3 h-3 bg-fuchsia-500 animate-pulse" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" />
          <h1 class="text-fuchsia-400 text-sm tracking-widest uppercase">Swarm Node - System Info</h1>
        </div>

        <div class="space-y-0 border border-slate-700/50">
          <div
            v-for="row in rows"
            :key="row.label"
            class="flex justify-between items-center px-4 py-3 border-b border-slate-700/50 last:border-b-0"
          >
            <span class="text-slate-500 text-xs tracking-wider uppercase">{{ row.label }}</span>
            <span class="text-cyan-400 text-sm font-bold tracking-wider">{{ row.value }}</span>
          </div>
        </div>

        <p v-if="authError" class="mt-4 text-xs text-red-400 tracking-wide">{{ authError }}</p>

        <div class="mt-6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full animate-ping" :class="info ? 'bg-cyan-400' : 'bg-red-500'" />
            <span class="text-xs text-slate-500 tracking-wider">
              {{ info ? 'ONLINE' : 'CONNECTING...' }}
            </span>
          </div>
          <span class="text-xs text-slate-600">refresh #{{ refreshCount }}</span>
        </div>

        <p class="mt-4 text-center text-[10px] text-slate-700 tracking-widest">
          AUTO-REFRESH EVERY 3s - WATCH HOSTNAME ACROSS REPLICAS
        </p>

        <button
          type="button"
          class="mt-5 w-full px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-xs tracking-widest uppercase hover:bg-slate-700 transition"
          @click="lock"
        >
          Lock Admin
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
type NodeInfo = {
  hostname: string
  containerId: string
  nodeIp: string
  timestamp: string
}

const router = useRouter()
const info = ref<NodeInfo | null>(null)
const refreshCount = ref(0)
const isCheckingSession = ref(true)
const isAuthorized = ref(false)
const passwordInput = ref('')
const authError = ref('')
const isRedirecting = ref(false)

const rows = computed(() => [
  { label: 'Hostname', value: info.value?.hostname ?? '-' },
  { label: 'Container ID', value: info.value?.containerId ?? '-' },
  { label: 'Node IP', value: info.value?.nodeIp ?? '-' },
  { label: 'Last updated', value: info.value?.timestamp ? new Date(info.value.timestamp).toLocaleTimeString() : '-' },
])

function getStatusCode(error: unknown): number | undefined {
  const maybeError = error as {
    statusCode?: number
    status?: number
    response?: { status?: number }
  }

  return maybeError.statusCode ?? maybeError.status ?? maybeError.response?.status
}

async function redirectToMain() {
  if (isRedirecting.value) return
  isRedirecting.value = true
  await router.replace('/')
}

async function fetchInfo() {
  if (!isAuthorized.value) return

  try {
    info.value = await $fetch('/api/info')
    refreshCount.value++
    authError.value = ''
  } catch (error) {
    const status = getStatusCode(error)

    if (status === 401 || status === 403) {
      await redirectToMain()
      return
    }

    if (status === 429) {
      authError.value = 'Too many requests. Please wait and try again.'
      return
    }

    authError.value = 'Unable to load admin data.'
  }
}

async function unlock() {
  authError.value = ''

  const password = passwordInput.value.trim()
  if (!password) {
    authError.value = 'Password is required.'
    return
  }

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password },
    })

    isAuthorized.value = true
    passwordInput.value = ''
    await fetchInfo()
  } catch (error) {
    const status = getStatusCode(error)

    if (status === 401 || status === 403) {
      authError.value = 'Invalid password.'
      return
    }

    if (status === 429) {
      authError.value = 'Too many attempts. Please wait before retrying.'
      return
    }

    authError.value = 'Login failed. Please try again.'
  }
}

async function lock() {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
  } catch {
    // Ignore logout network errors and clear local state anyway.
  }

  isAuthorized.value = false
  info.value = null
  authError.value = ''
  passwordInput.value = ''
}

onMounted(async () => {
  try {
    await $fetch('/api/admin/session')
    isAuthorized.value = true
    await fetchInfo()
  } catch (error) {
    const status = getStatusCode(error)
    if (status !== 401 && status !== 403) {
      authError.value = 'Unable to verify session.'
    }
  } finally {
    isCheckingSession.value = false
  }

  const interval = setInterval(() => {
    if (isAuthorized.value) {
      fetchInfo()
    }
  }, 3000)

  onUnmounted(() => clearInterval(interval))
})
</script>
