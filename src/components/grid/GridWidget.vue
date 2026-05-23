<script setup lang="ts">
import type { Field, LayoutItem } from '@/types'
import FieldRenderer from '@/components/fields/FieldRenderer.vue'

const props = defineProps<{
  field: Field
  layoutItem: LayoutItem
  value: unknown
  editMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'remove', fieldId: number): void
  (e: 'configure', fieldId: number): void
}>()
</script>

<template>
  <div
    class="grid-widget h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
    :class="{ 'ring-2 ring-brand-300 ring-offset-1': editMode }"
  >
    <!-- Edit mode toolbar -->
    <div
      v-if="editMode"
      class="widget-toolbar flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200 cursor-grab active:cursor-grabbing"
    >
      <span class="text-xs font-medium text-gray-600 truncate">{{ field.name }}</span>
      <div class="flex items-center gap-1 flex-shrink-0">
        <button
          class="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors"
          title="Configure widget"
          @click.stop="emit('configure', field.id)"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          class="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition-colors"
          title="Remove widget"
          @click.stop="emit('remove', field.id)"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="widget-content flex-1 min-h-0 p-3 overflow-hidden">
      <FieldRenderer
        :field="field"
        :value="value"
        :display-options="layoutItem.displayOptions"
      />
    </div>
  </div>
</template>
