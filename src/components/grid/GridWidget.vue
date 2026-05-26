<script setup lang="ts">
import { computed } from 'vue'
import type { Field, LayoutItem } from '@/types'
import FieldRenderer from '@/components/fields/FieldRenderer.vue'
import FieldEditor from '@/components/fields/FieldEditor.vue'
import MultipleField from '@/components/fields/MultipleField.vue'
import MultipleEditor from '@/components/fields/MultipleEditor.vue'

const props = defineProps<{
  field: Field
  layoutItem: LayoutItem
  value: unknown
  editMode?: boolean
  recordEditable?: boolean
}>()

const emit = defineEmits<{
  (e: 'remove', fieldId: number): void
  (e: 'configure', fieldId: number): void
  (e: 'update:value', payload: { fieldId: number; value: unknown }): void
}>()

const isImage = computed(() => props.field.type === 'image')
const isMultiple = computed(() => props.field.type === 'multiple')
const variant = computed(() => props.layoutItem.displayOptions?.variant ?? 'default')
const showLabel = computed(() => props.layoutItem.displayOptions?.showLabel !== false)
const labelPosition = computed(() => props.layoutItem.displayOptions?.labelPosition ?? 'top')

const isEmpty = computed(() => {
  const v = props.value
  if (v === null || v === undefined) return true
  if (typeof v === 'string' && v.trim() === '') return true
  if (Array.isArray(v) && v.length === 0) return true
  return false
})

const showRequiredWarning = computed(() => props.field.required === true && isEmpty.value)

const variantClass = computed(() => ({
  default:   'bg-white border border-blue-100 shadow-sm',
  card:      'bg-white border border-blue-100 shadow-md',
  highlight: 'bg-blue-50 border border-blue-200 shadow-sm',
  minimal:   'bg-transparent border-0 shadow-none',
}[variant.value] ?? 'bg-white border border-blue-100 shadow-sm'))

const ringClass = computed(() => {
  if (props.editMode) return 'ring-2 ring-blue-300 ring-offset-1 hover:shadow-md'
  if (showRequiredWarning.value) return 'ring-2 ring-amber-400 ring-offset-1'
  if (props.recordEditable) return 'ring-2 ring-blue-400 ring-offset-1'
  return ''
})
</script>

<template>
  <div
    class="grid-widget h-full flex flex-col rounded-xl overflow-hidden transition-shadow relative"
    :class="[variantClass, ringClass]"
  >
    <!-- Builder drag handle (editMode) -->
    <div
      v-if="editMode"
      class="widget-toolbar flex-shrink-0 flex items-center justify-between px-3 py-1.5 bg-surface-sunken border-b border-blue-100 cursor-grab active:cursor-grabbing select-none"
    >
      <span class="text-xs font-medium text-ink-muted truncate min-w-0 pr-2">{{ field.name }}</span>
      <div class="flex items-center gap-0.5 flex-shrink-0">
        <button
          type="button"
          class="p-1 hover:bg-blue-100 rounded text-ink-subtle hover:text-ink transition-colors"
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
          type="button"
          class="p-1 hover:bg-red-100 rounded text-ink-subtle hover:text-red-600 transition-colors"
          title="Remove widget"
          @click.stop="emit('remove', field.id)"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Record edit mode -->
    <template v-else-if="recordEditable">
      <div class="flex-shrink-0 px-4 pt-2.5 pb-0.5 flex items-center gap-1">
        <span class="text-[11px] font-semibold uppercase tracking-widest text-ink-subtle leading-none">
          {{ field.name }}
        </span>
        <span v-if="field.required" class="text-amber-500 text-xs leading-none ml-0.5">*</span>
      </div>
      <!-- Multiple: bypass FieldEditor, render MultipleEditor directly with its own scroll -->
      <div v-if="isMultiple" class="flex-1 min-h-0 overflow-y-auto px-4 pb-3">
        <MultipleEditor
          :field="field"
          :value="value"
          @update:value="emit('update:value', { fieldId: field.id, value: $event })"
        />
      </div>
      <div v-else class="flex-1 min-h-0 overflow-y-auto px-4 pb-3">
        <FieldEditor
          :field="field"
          :value="value"
          @update:value="emit('update:value', { fieldId: field.id, value: $event })"
        />
      </div>
    </template>

    <!-- Normal view mode -->
    <template v-else>
      <!-- Image fields -->
      <template v-if="isImage">
        <div
          v-if="showLabel && labelPosition !== 'hidden'"
          class="flex-shrink-0 px-4 pt-3 pb-1"
        >
          <span class="text-[11px] font-semibold uppercase tracking-widest text-ink-subtle leading-none">
            {{ field.name }}
          </span>
        </div>
        <div class="flex-1 min-h-0 overflow-hidden">
          <FieldRenderer
            :field="field"
            :value="value"
            :display-options="{ ...layoutItem.displayOptions, showLabel: false }"
          />
        </div>
      </template>

      <!-- Multiple: bypass FieldRenderer so overflow-hidden doesn't trap the table -->
      <template v-else-if="isMultiple">
        <div
          v-if="showLabel && labelPosition !== 'hidden'"
          class="flex-shrink-0 px-4 pt-3 pb-1"
        >
          <span class="text-[11px] font-semibold uppercase tracking-widest text-ink-subtle leading-none">
            {{ field.name }}
          </span>
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto px-4 pb-3">
          <MultipleField
            :value="value"
            :referenced-class-id="field.referencedClassId"
          />
        </div>
      </template>

      <!-- All other fields -->
      <div v-else class="flex-1 min-h-0 overflow-y-auto px-4 py-3">
        <FieldRenderer
          :field="field"
          :value="value"
          :display-options="layoutItem.displayOptions"
        />
      </div>
    </template>

    <!-- Required field badge (view mode only) -->
    <div
      v-if="showRequiredWarning && !editMode && !recordEditable"
      class="absolute bottom-1.5 right-1.5 pointer-events-none"
    >
      <span class="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full leading-none">
        Required
      </span>
    </div>
  </div>
</template>
