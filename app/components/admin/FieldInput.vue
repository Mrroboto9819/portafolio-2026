<template>
  <label class="block">
    <span class="text-[10px] text-slate-500 tracking-wider uppercase flex items-center gap-2">
      {{ field.label }}
      <span v-if="field.required" class="text-fuchsia-400">*</span>
    </span>

    <!-- text / url / number -->
    <input
      v-if="['text','url','number'].includes(field.type)"
      :type="field.type === 'number' ? 'number' : 'text'"
      :value="modelValue ?? ''"
      :placeholder="field.placeholder ?? ''"
      :min="field.min"
      :max="field.max"
      class="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400"
      @input="onInput($event)"
    >

    <!-- textarea -->
    <textarea
      v-else-if="field.type === 'textarea'"
      :value="modelValue ?? ''"
      :placeholder="field.placeholder ?? ''"
      rows="3"
      class="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />

    <!-- boolean -->
    <button
      v-else-if="field.type === 'boolean'"
      type="button"
      class="mt-1 inline-flex items-center gap-2 px-3 py-1.5 border text-[10px] tracking-widest uppercase transition"
      :class="modelValue
        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span class="w-2 h-2 rounded-full" :class="modelValue ? 'bg-cyan-400' : 'bg-slate-600'" />
      {{ modelValue ? 'Yes' : 'No' }}
    </button>

    <!-- select -->
    <select
      v-else-if="field.type === 'select'"
      :value="modelValue ?? ''"
      class="mt-1 w-full px-3 py-2 bg-slate-950 border border-slate-700 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">—</option>
      <option v-for="opt in field.options ?? []" :key="opt" :value="opt">{{ opt }}</option>
    </select>

    <!-- tags (string array via comma-separated input) -->
    <div v-else-if="field.type === 'tags'" class="mt-1">
      <div v-if="(modelValue as string[] | undefined)?.length" class="flex flex-wrap gap-1 mb-1.5">
        <span
          v-for="(tag, idx) in (modelValue as string[])"
          :key="idx"
          class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] border border-cyan-400/40 text-cyan-300 bg-cyan-400/5"
        >
          {{ tag }}
          <button
            type="button"
            class="text-slate-500 hover:text-red-400"
            @click="removeTag(idx)"
          >×</button>
        </span>
      </div>
      <input
        type="text"
        :value="tagDraft"
        :placeholder="field.placeholder ?? 'Type and press Enter or comma'"
        class="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400"
        @input="tagDraft = ($event.target as HTMLInputElement).value"
        @keydown.enter.prevent="commitTag()"
        @keydown.,.prevent="commitTag()"
        @blur="commitTag()"
      >
    </div>

    <!-- json -->
    <textarea
      v-else-if="field.type === 'json'"
      :value="jsonText"
      rows="5"
      spellcheck="false"
      class="mt-1 w-full px-3 py-2 bg-slate-950 border text-cyan-300 text-xs font-mono focus:outline-none"
      :class="jsonError ? 'border-red-500' : 'border-slate-700 focus:border-cyan-400'"
      @input="onJsonInput($event)"
    />

    <p v-if="field.hint" class="mt-1 text-[10px] text-slate-600">{{ field.hint }}</p>
    <p v-if="field.type === 'json' && jsonError" class="mt-1 text-[10px] text-red-400">{{ jsonError }}</p>
  </label>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FieldDef } from '../../utils/adminSchemas'

const props = defineProps<{ field: FieldDef; modelValue: unknown }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: unknown): void }>()

// --- generic ---
function onInput(ev: Event) {
  const target = ev.target as HTMLInputElement
  if (props.field.type === 'number') {
    const n = target.value === '' ? null : Number(target.value)
    emit('update:modelValue', Number.isFinite(n as number) ? n : null)
  } else {
    emit('update:modelValue', target.value)
  }
}

// --- tags ---
const tagDraft = ref('')
function commitTag() {
  const t = tagDraft.value.trim()
  if (!t) return
  const list = Array.isArray(props.modelValue) ? [...(props.modelValue as string[])] : []
  list.push(t)
  emit('update:modelValue', list)
  tagDraft.value = ''
}
function removeTag(idx: number) {
  const list = Array.isArray(props.modelValue) ? [...(props.modelValue as string[])] : []
  list.splice(idx, 1)
  emit('update:modelValue', list)
}

// --- json ---
// We mirror the parsed value as text in a local ref so the user can type
// invalid JSON mid-edit without us blowing away their input on each keystroke.
const jsonText = ref('')
const jsonError = ref('')
watch(
  () => props.modelValue,
  (val) => {
    // Keep jsonText in sync when an external update happens (e.g., switching items),
    // but don't clobber the user's in-progress text if it parses to the same value.
    try {
      const parsed = jsonText.value ? JSON.parse(jsonText.value) : undefined
      if (JSON.stringify(parsed) === JSON.stringify(val)) return
    } catch { /* fall through */ }
    jsonText.value = JSON.stringify(val ?? [], null, 2)
    jsonError.value = ''
  },
  { immediate: true },
)
function onJsonInput(ev: Event) {
  const txt = (ev.target as HTMLTextAreaElement).value
  jsonText.value = txt
  if (!txt.trim()) {
    jsonError.value = ''
    emit('update:modelValue', [])
    return
  }
  try {
    const parsed = JSON.parse(txt)
    jsonError.value = ''
    emit('update:modelValue', parsed)
  } catch (err) {
    jsonError.value = (err as Error).message
  }
}
</script>
