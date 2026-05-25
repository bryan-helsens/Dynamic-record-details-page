<script setup lang="ts">
import type { Field } from '@/types'
import MultipleEditor from './MultipleEditor.vue'

const props = defineProps<{ field: Field; value: unknown }>()
const emit = defineEmits<{ (e: 'update:value', v: unknown): void }>()

const isSelected = (opt: string) =>
  Array.isArray(props.value) && (props.value as string[]).includes(opt)

function toggleMulti(opt: string) {
  const current = Array.isArray(props.value) ? [...(props.value as string[])] : []
  const idx = current.indexOf(opt)
  if (idx === -1) current.push(opt)
  else current.splice(idx, 1)
  emit('update:value', current)
}
</script>

<template>
  <div class="h-full flex flex-col justify-center">

    <!-- text / url / email -->
    <input
      v-if="['text', 'url', 'email'].includes(field.type)"
      :type="field.type === 'text' ? 'text' : field.type"
      :value="String(value ?? '')"
      class="w-full px-2.5 py-1.5 text-sm rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none"
      @input="emit('update:value', ($event.target as HTMLInputElement).value)"
    />

    <!-- number -->
    <input
      v-else-if="field.type === 'number'"
      type="number"
      :value="(value as number) ?? ''"
      class="w-full px-2.5 py-1.5 text-sm rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none"
      @input="emit('update:value', Number(($event.target as HTMLInputElement).value))"
    />

    <!-- textarea -->
    <textarea
      v-else-if="field.type === 'textarea'"
      :value="String(value ?? '')"
      rows="3"
      class="w-full px-2.5 py-1.5 text-sm rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none resize-none"
      @input="emit('update:value', ($event.target as HTMLTextAreaElement).value)"
    />

    <!-- boolean -->
    <label v-else-if="field.type === 'boolean'" class="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        :checked="Boolean(value)"
        class="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
        @change="emit('update:value', ($event.target as HTMLInputElement).checked)"
      />
      <span class="text-sm text-ink">{{ value ? 'Yes' : 'No' }}</span>
    </label>

    <!-- date / datetime -->
    <input
      v-else-if="['date', 'datetime'].includes(field.type)"
      type="date"
      :value="String(value ?? '')"
      class="w-full px-2.5 py-1.5 text-sm rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none"
      @input="emit('update:value', ($event.target as HTMLInputElement).value)"
    />

    <!-- select -->
    <select
      v-else-if="field.type === 'select'"
      :value="String(value ?? '')"
      class="w-full px-2.5 py-1.5 text-sm rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none"
      @change="emit('update:value', ($event.target as HTMLSelectElement).value)"
    >
      <option value="">— Select —</option>
      <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
    </select>

    <!-- multiselect -->
    <div v-else-if="field.type === 'multiselect'" class="flex flex-wrap gap-1.5 pt-0.5">
      <label
        v-for="opt in field.options"
        :key="opt"
        class="flex items-center cursor-pointer px-2.5 py-1 rounded-md text-xs border transition-colors select-none"
        :class="isSelected(opt)
          ? 'bg-blue-600 text-white border-blue-600'
          : 'border-blue-200 text-ink-muted hover:border-blue-400 bg-white'"
      >
        <input type="checkbox" :checked="isSelected(opt)" class="sr-only" @change="toggleMulti(opt)" />
        {{ opt }}
      </label>
    </div>

    <!-- color -->
    <div v-else-if="field.type === 'color'" class="flex items-center gap-2.5">
      <input
        type="color"
        :value="String(value ?? '#000000')"
        class="w-8 h-8 rounded cursor-pointer border border-blue-200"
        @input="emit('update:value', ($event.target as HTMLInputElement).value)"
      />
      <span class="text-sm text-ink-muted font-mono">{{ value || '—' }}</span>
    </div>

    <!-- multiple -->
    <MultipleEditor
      v-else-if="field.type === 'multiple'"
      :field="field"
      :value="value"
      @update:value="emit('update:value', $event)"
    />

    <!-- image / fallback (URL input) -->
    <input
      v-else
      type="url"
      :value="String(value ?? '')"
      placeholder="https://…"
      class="w-full px-2.5 py-1.5 text-sm rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none"
      @input="emit('update:value', ($event.target as HTMLInputElement).value)"
    />

  </div>
</template>
