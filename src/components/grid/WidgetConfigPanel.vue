<script setup lang="ts">
import { reactive } from 'vue'
import type { Field, LayoutItem, WidgetDisplayOptions } from '@/types'

const props = defineProps<{
  field: Field
  layoutItem: LayoutItem
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update', options: WidgetDisplayOptions): void
}>()

const options = reactive<WidgetDisplayOptions>({
  showLabel: props.layoutItem.displayOptions?.showLabel ?? true,
  labelPosition: props.layoutItem.displayOptions?.labelPosition ?? 'top',
  fontSize: props.layoutItem.displayOptions?.fontSize ?? 'md',
  variant: props.layoutItem.displayOptions?.variant ?? 'default',
})

function apply() {
  emit('update', { ...options })
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" @click.self="emit('close')">
    <div class="bg-white rounded-xl shadow-xl w-80 border border-gray-200">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 class="font-semibold text-gray-900">Configure: {{ field.name }}</h3>
        <button class="text-gray-400 hover:text-gray-700" @click="emit('close')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="px-5 py-4 space-y-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input v-model="options.showLabel" type="checkbox" class="w-4 h-4 rounded border-gray-300 text-brand-600" />
          <span class="text-sm text-gray-700">Show field label</span>
        </label>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Label position</label>
          <select
            v-model="options.labelPosition"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="top">Top</option>
            <option value="left">Left (inline)</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Font size</label>
          <div class="grid grid-cols-4 gap-1">
            <button
              v-for="size in ['sm', 'md', 'lg', 'xl']"
              :key="size"
              class="py-1.5 rounded text-xs border transition-colors"
              :class="options.fontSize === size
                ? 'bg-brand-600 text-white border-brand-600'
                : 'border-gray-300 text-gray-600 hover:border-brand-400'"
              @click="options.fontSize = size as WidgetDisplayOptions['fontSize']"
            >
              {{ size.toUpperCase() }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1.5">Variant</label>
          <div class="grid grid-cols-2 gap-1.5">
            <button
              v-for="variant in ['default', 'card', 'highlight', 'minimal']"
              :key="variant"
              class="py-1.5 px-2 rounded text-xs border transition-colors capitalize"
              :class="options.variant === variant
                ? 'bg-brand-600 text-white border-brand-600'
                : 'border-gray-300 text-gray-600 hover:border-brand-400'"
              @click="options.variant = variant as WidgetDisplayOptions['variant']"
            >
              {{ variant }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
        <button
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors"
          @click="apply"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>
