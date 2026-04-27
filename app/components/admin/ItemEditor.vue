<template>
  <div class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" @click.self="emit('close')">
    <div
      class="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 flex flex-col"
      style="clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))"
    >
      <header class="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-fuchsia-500 animate-pulse" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" />
          <h3 class="text-fuchsia-400 text-xs tracking-widest uppercase">
            {{ mode === 'create' ? 'Create' : 'Edit' }} — {{ schema.label }}
          </h3>
        </div>
        <button
          type="button"
          class="text-slate-500 hover:text-slate-200 text-xs tracking-wider"
          @click="emit('close')"
        >× CLOSE</button>
      </header>

      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <FieldInput
          v-for="f in schema.fields"
          :key="f.key"
          :field="f"
          :model-value="form[f.key]"
          @update:model-value="form[f.key] = $event"
        />

        <!-- isActive + order — always shown -->
        <div class="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/40">
          <FieldInput
            :field="{ key: 'isActive', label: 'Visible on landing', type: 'boolean' }"
            :model-value="form.isActive"
            @update:model-value="form.isActive = $event"
          />
          <FieldInput
            :field="{ key: 'order', label: 'Order', type: 'number', hint: 'Lower = earlier. Leave blank to append.' }"
            :model-value="form.order"
            @update:model-value="form.order = $event"
          />
        </div>

        <p v-if="error" class="text-xs text-red-400">{{ error }}</p>
      </div>

      <footer class="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-700/50 bg-slate-950/40">
        <button
          type="button"
          class="px-3 py-1.5 border border-slate-700 text-slate-300 text-[10px] tracking-widest uppercase hover:bg-slate-800"
          @click="emit('close')"
        >Cancel</button>
        <button
          type="button"
          class="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-[10px] tracking-widest uppercase hover:bg-cyan-500/30 transition disabled:opacity-60"
          :disabled="busy"
          @click="save"
        >{{ busy ? 'Saving…' : (mode === 'create' ? 'Create' : 'Save') }}</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import FieldInput from './FieldInput.vue'
import { blankItem, type CollectionSchema } from '../../utils/adminSchemas'

const props = defineProps<{
  schema: CollectionSchema
  mode: 'create' | 'edit'
  item: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', item: Record<string, unknown>): void
}>()

const form = reactive<Record<string, unknown>>({ isActive: true, order: null })
const busy = ref(false)
const error = ref('')

function reset() {
  // Wipe and re-seed so reactive proxies update cleanly between opens.
  for (const k of Object.keys(form)) delete (form as any)[k]
  if (props.mode === 'create' || !props.item) {
    Object.assign(form, blankItem(props.schema))
  } else {
    // Hydrate from existing item — schema fields first, then isActive/order.
    for (const f of props.schema.fields) {
      ;(form as any)[f.key] = (props.item as any)[f.key] ?? blankItem(props.schema)[f.key]
    }
    form.isActive = (props.item as any).isActive !== false
    form.order = (props.item as any).order ?? null
  }
  error.value = ''
}

watch(() => [props.mode, props.item], reset, { immediate: true })

async function save() {
  // Required-field validation per schema.
  for (const f of props.schema.fields) {
    if (f.required) {
      const v = (form as any)[f.key]
      if (v === '' || v === null || v === undefined) {
        error.value = `${f.label} is required.`
        return
      }
    }
  }

  busy.value = true
  error.value = ''
  // Strip null/empty `order` so the server appends rather than positioning at 0.
  const body = { ...form }
  if (body.order === null || body.order === '' || body.order === undefined) {
    delete (body as any).order
  }

  try {
    let res: { item: Record<string, unknown> }
    if (props.mode === 'create') {
      res = await $fetch<{ item: Record<string, unknown> }>(`/api/v1/${props.schema.slug}`, {
        method: 'POST',
        body,
      })
    } else {
      const id = (props.item as any).id
      res = await $fetch<{ item: Record<string, unknown> }>(`/api/v1/${props.schema.slug}/${id}`, {
        method: 'PUT',
        body,
      })
    }
    emit('saved', res.item)
  } catch (err) {
    error.value = (err as { statusMessage?: string }).statusMessage || 'Save failed.'
  } finally {
    busy.value = false
  }
}
</script>
