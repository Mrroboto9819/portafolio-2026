<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-mono relative overflow-x-hidden">
    <!-- Background -->
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

    <!-- Login screen -->
    <div v-if="isCheckingSession || !isAuthorized" class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div
        class="w-full max-w-md p-8 border border-slate-700/80 bg-slate-900/60 backdrop-blur-sm"
        style="clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))"
      >
        <div class="absolute top-0 right-0 w-5 h-5 bg-gradient-to-br from-cyan-500 to-fuchsia-500" style="clip-path: polygon(100% 0, 0 0, 100% 100%)" />

        <div v-if="isCheckingSession" class="text-center">
          <h1 class="text-fuchsia-400 text-sm tracking-widest uppercase">Checking Session</h1>
          <p class="mt-3 text-xs text-slate-400">Please wait…</p>
        </div>

        <form v-else class="space-y-5" @submit.prevent="login">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-fuchsia-500 animate-pulse" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" />
            <h1 class="text-fuchsia-400 text-sm tracking-widest uppercase">Admin Access</h1>
          </div>

          <label class="block">
            <span class="text-xs text-slate-500 tracking-wider uppercase">Username</span>
            <input
              v-model="usernameInput"
              type="text"
              autocomplete="username"
              class="mt-2 w-full px-3 py-2 bg-slate-950 border border-slate-700 text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
          </label>

          <label class="block">
            <span class="text-xs text-slate-500 tracking-wider uppercase">Password</span>
            <input
              v-model="passwordInput"
              type="password"
              autocomplete="current-password"
              class="mt-2 w-full px-3 py-2 bg-slate-950 border border-slate-700 text-cyan-300 focus:outline-none focus:border-cyan-400"
            >
          </label>

          <p v-if="authError" class="text-xs text-red-400">{{ authError }}</p>

          <button
            type="submit"
            class="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-xs tracking-widest uppercase hover:bg-cyan-500/30 transition"
          >
            Login
          </button>

          <p class="text-[10px] text-slate-600 tracking-wide pt-2 border-t border-slate-800">
            First time? Bootstrap the initial admin with the SETUP_TOKEN —
            see <code class="text-slate-500">README</code> /
            <code class="text-slate-500">POST /api/v1/auth/setup</code>.
          </p>
        </form>
      </div>
    </div>

    <!-- Authorized dashboard -->
    <div v-else class="relative z-10 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <header class="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-700/50">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 bg-fuchsia-500 animate-pulse" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" />
          <h1 class="text-fuchsia-400 text-sm tracking-widest uppercase">Admin Panel</h1>
          <span class="text-xs text-slate-500">— {{ currentUser?.username }}</span>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3 py-1.5 bg-fuchsia-500/20 border border-fuchsia-500 text-fuchsia-300 text-[10px] tracking-widest uppercase hover:bg-fuchsia-500/30 transition disabled:opacity-60"
            :disabled="isRestarting"
            @click="restart"
          >
            {{ isRestarting ? 'Restarting…' : 'Restart' }}
          </button>
          <button
            type="button"
            class="px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] tracking-widest uppercase hover:bg-slate-700 transition"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </header>

      <!-- Node info -->
      <section class="mb-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="row in infoRows" :key="row.label" class="p-3 border border-slate-700/50 bg-slate-900/40">
          <div class="text-[10px] text-slate-500 uppercase tracking-wider">{{ row.label }}</div>
          <div class="mt-1 text-sm text-cyan-400 font-bold truncate">{{ row.value }}</div>
        </div>
      </section>

      <p v-if="restartMessage" class="mb-4 text-xs text-cyan-300">{{ restartMessage }}</p>
      <p v-if="authError" class="mb-4 text-xs text-red-400">{{ authError }}</p>

      <!-- Collection tabs -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="slug in collectionSlugs"
          :key="slug"
          @click="activeCollection = slug"
          class="px-3 py-1.5 text-[10px] tracking-widest uppercase border transition"
          :class="activeCollection === slug
            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
            : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500'"
        >
          {{ SCHEMAS[slug].label }}
        </button>
      </div>

      <CollectionManager v-if="activeSchema" :schema="activeSchema" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CollectionManager from '../components/admin/CollectionManager.vue'
import { COLLECTION_SLUGS, SCHEMAS } from '../utils/adminSchemas'

type NodeInfo = {
  hostname: string
  containerId: string
  nodeIp: string
  timestamp: string
}

type AuthUser = { id: string; username: string; role: string }

const collectionSlugs = COLLECTION_SLUGS

const router = useRouter()

const isCheckingSession = ref(true)
const isAuthorized = ref(false)
const currentUser = ref<AuthUser | null>(null)
const usernameInput = ref('')
const passwordInput = ref('')
const authError = ref('')

const info = ref<NodeInfo | null>(null)
const isRestarting = ref(false)
const restartMessage = ref('')

const activeCollection = ref<string>(collectionSlugs[0] ?? '')
const activeSchema = computed(() => activeCollection.value ? SCHEMAS[activeCollection.value] : null)

const infoRows = computed(() => [
  { label: 'Hostname', value: info.value?.hostname ?? '-' },
  { label: 'Container', value: info.value?.containerId ?? '-' },
  { label: 'Node IP', value: info.value?.nodeIp ?? '-' },
  { label: 'Updated', value: info.value?.timestamp ? new Date(info.value.timestamp).toLocaleTimeString() : '-' },
])

function statusOf(err: unknown): number | undefined {
  const e = err as { statusCode?: number; status?: number; response?: { status?: number } }
  return e.statusCode ?? e.status ?? e.response?.status
}

// --- Auth flow ---------------------------------------------------------------

async function authedFetch<T = unknown>(url: string, opts: Parameters<typeof $fetch>[1] = {}): Promise<T> {
  // Single retry: if the access token is expired, refresh once then retry.
  // The httpOnly refresh cookie is sent automatically.
  try {
    return await $fetch<T>(url, opts as any)
  } catch (err) {
    const status = statusOf(err)
    if (status !== 401) throw err
    try {
      await $fetch('/api/v1/auth/refresh', { method: 'POST' })
    } catch {
      throw err
    }
    return await $fetch<T>(url, opts as any)
  }
}

async function login() {
  authError.value = ''
  if (!usernameInput.value.trim() || !passwordInput.value) {
    authError.value = 'Username and password required.'
    return
  }
  try {
    const res = await $fetch<{ user: AuthUser }>('/api/v1/auth/login', {
      method: 'POST',
      body: { username: usernameInput.value.trim(), password: passwordInput.value },
    })
    currentUser.value = res.user
    isAuthorized.value = true
    passwordInput.value = ''
    await refreshDashboard()
  } catch (err) {
    const status = statusOf(err)
    if (status === 401) authError.value = 'Invalid credentials.'
    else if (status === 429) authError.value = 'Too many attempts — try again later.'
    else authError.value = 'Login failed.'
  }
}

async function logout() {
  try {
    await $fetch('/api/v1/auth/logout', { method: 'POST' })
  } catch {
    // Best-effort; clear local state anyway.
  }
  isAuthorized.value = false
  currentUser.value = null
  info.value = null
  await router.replace('/admin')
}

// --- Dashboard ---------------------------------------------------------------

async function fetchInfo() {
  if (!isAuthorized.value) return
  try {
    info.value = await authedFetch<NodeInfo>('/api/v1/admin/info')
  } catch (err) {
    const status = statusOf(err)
    if (status === 401) {
      isAuthorized.value = false
      return
    }
    if (status === 429) authError.value = 'Too many requests — slow down.'
    else authError.value = 'Unable to load admin info.'
  }
}

async function restart() {
  if (isRestarting.value) return
  isRestarting.value = true
  authError.value = ''
  restartMessage.value = ''
  try {
    const res = await authedFetch<{ restartedAt: string }>('/api/v1/admin/restart', { method: 'POST' })
    restartMessage.value = `Restarting at ${new Date(res.restartedAt).toLocaleTimeString()}. Page will reconnect shortly.`
  } catch (err) {
    const status = statusOf(err)
    if (status === 401) isAuthorized.value = false
    else if (status === 429) authError.value = 'Too many restart requests.'
    else authError.value = 'Restart failed.'
  } finally {
    isRestarting.value = false
  }
}

async function refreshDashboard() {
  await fetchInfo()
}

// --- Lifecycle ---------------------------------------------------------------

let pollInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  try {
    const res = await $fetch<{ user: AuthUser }>('/api/v1/auth/session')
    currentUser.value = res.user
    isAuthorized.value = true
    await refreshDashboard()
  } catch (err) {
    const status = statusOf(err)
    if (status === 401) {
      // Try to silently refresh — works if a valid refresh cookie is still present.
      try {
        const res = await $fetch<{ user: AuthUser }>('/api/v1/auth/refresh', { method: 'POST' })
        currentUser.value = res.user
        isAuthorized.value = true
        await refreshDashboard()
      } catch {
        // No usable session — show login form.
      }
    } else {
      authError.value = 'Unable to verify session.'
    }
  } finally {
    isCheckingSession.value = false
  }

  pollInterval = setInterval(() => {
    if (isAuthorized.value) fetchInfo()
  }, 30000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>
