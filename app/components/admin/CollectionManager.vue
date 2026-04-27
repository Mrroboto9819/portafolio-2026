<template>
  <section class="border border-slate-700/50 bg-slate-900/40">
    <header class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-700/50">
      <div>
        <h2 class="text-fuchsia-400 text-sm tracking-widest uppercase">{{ schema.label }}</h2>
        <p class="text-[10px] text-slate-500 mt-0.5">{{ schema.blurb }}</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[10px] text-slate-500">
          {{ activeCount }} active · {{ inactiveCount }} hidden
        </span>
        <button
          type="button"
          class="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-[10px] tracking-widest uppercase hover:bg-cyan-500/30 transition"
          @click="startCreate"
        >+ New {{ schema.label.replace(/s$/i, '') }}</button>
      </div>
    </header>

    <div class="p-4">
      <p v-if="loading" class="text-xs text-slate-500 py-8 text-center">Loading…</p>
      <p v-else-if="!items.length" class="text-xs text-slate-500 py-8 text-center">
        No items yet — click <span class="text-cyan-400">+ New</span> to add the first one.
      </p>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <article
          v-for="item in items"
          :key="(item as any).id"
          class="relative border bg-slate-950/40 p-3 transition flex flex-col gap-2"
          :class="(item as any).isActive === false
            ? 'border-slate-700/40 opacity-60'
            : 'border-slate-700/70 hover:border-fuchsia-400/60'"
          style="clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))"
        >
          <div class="absolute top-0 right-0 w-3 h-3" :class="(item as any).isActive === false ? 'bg-slate-700' : 'bg-gradient-to-br from-cyan-500 to-fuchsia-500'" style="clip-path: polygon(100% 0, 0 0, 100% 100%)" />

          <div class="flex items-start gap-3">
            <div
              v-if="schema.cardIcon?.(item)"
              class="shrink-0 w-12 h-12 border border-slate-700 bg-slate-900 flex items-center justify-center p-1.5"
            >
              <img :src="schema.cardIcon(item) as string" :alt="schema.cardTitle(item)" class="max-w-full max-h-full object-contain">
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-cyan-300 text-sm font-bold truncate">{{ schema.cardTitle(item) }}</div>
              <div v-if="schema.cardSubtitle?.(item)" class="text-[10px] text-slate-400 truncate mt-0.5">
                {{ schema.cardSubtitle(item) }}
              </div>
              <div class="text-[10px] text-slate-600 truncate mt-1">
                id: {{ (item as any).id }} · order: {{ (item as any).order ?? 0 }}
              </div>
            </div>
          </div>

          <div class="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-slate-700/40">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-2 py-1 border text-[10px] tracking-wider uppercase transition"
              :class="(item as any).isActive === false
                ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-300'
                : 'bg-cyan-500/15 border-cyan-500 text-cyan-300 hover:bg-cyan-500/30'"
              :disabled="togglingId === (item as any).id"
              @click="toggleActive(item)"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="(item as any).isActive === false ? 'bg-slate-600' : 'bg-cyan-400 animate-pulse'" />
              {{ (item as any).isActive === false ? 'Hidden' : 'Active' }}
            </button>
            <div class="flex gap-1">
              <button
                type="button"
                class="px-2 py-1 border border-slate-600 text-slate-300 text-[10px] uppercase hover:bg-slate-800"
                @click="startEdit(item)"
              >Edit</button>
              <button
                type="button"
                class="px-2 py-1 border border-red-700/70 text-red-400 text-[10px] uppercase hover:bg-red-900/40"
                @click="askDelete(item)"
              >Del</button>
            </div>
          </div>
        </article>
      </div>
    </div>

    <ItemEditor
      v-if="editorOpen"
      :schema="schema"
      :mode="editorMode"
      :item="editingItem"
      @close="editorOpen = false"
      @saved="onSaved"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ItemEditor from './ItemEditor.vue'
import type { CollectionSchema } from '../../utils/adminSchemas'

const props = defineProps<{ schema: CollectionSchema }>()

type Item = Record<string, unknown> & { id: string; isActive?: boolean; order?: number }

const items = ref<Item[]>([])
const loading = ref(true)
const togglingId = ref<string | null>(null)

const editorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editingItem = ref<Item | null>(null)

const activeCount = computed(() => items.value.filter(i => i.isActive !== false).length)
const inactiveCount = computed(() => items.value.length - activeCount.value)

async function load() {
  loading.value = true
  try {
    const res = await $fetch<{ items: Item[] }>(`/api/v1/${props.schema.slug}?all=true`)
    items.value = res.items
  } catch (err) {
    console.error('[CollectionManager] load failed', err)
    items.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.schema.slug, load, { immediate: true })

function startCreate() {
  editorMode.value = 'create'
  editingItem.value = null
  editorOpen.value = true
}

function startEdit(item: Item) {
  editorMode.value = 'edit'
  editingItem.value = item
  editorOpen.value = true
}

function onSaved(saved: Record<string, unknown>) {
  editorOpen.value = false
  // Optimistic upsert into local list — re-fetch in background to stay
  // consistent with server-side normalisation (e.g. order auto-assigned).
  const idx = items.value.findIndex(i => i.id === (saved as any).id)
  if (idx >= 0) items.value[idx] = saved as Item
  else items.value.push(saved as Item)
  void load()
}

async function toggleActive(item: Item) {
  togglingId.value = item.id
  const next = item.isActive === false
  try {
    const res = await $fetch<{ item: Item }>(`/api/v1/${props.schema.slug}/${item.id}`, {
      method: 'PUT',
      body: { isActive: next },
    })
    const idx = items.value.findIndex(i => i.id === item.id)
    if (idx >= 0) items.value[idx] = res.item
  } catch (err) {
    console.error('[CollectionManager] toggle failed', err)
  } finally {
    togglingId.value = null
  }
}

async function askDelete(item: Item) {
  const label = props.schema.cardTitle(item)
  if (!confirm(`Delete "${label}"? This cannot be undone.`)) return
  try {
    await $fetch(`/api/v1/${props.schema.slug}/${item.id}`, { method: 'DELETE' })
    items.value = items.value.filter(i => i.id !== item.id)
  } catch (err) {
    console.error('[CollectionManager] delete failed', err)
  }
}

defineExpose({ reload: load })
</script>
