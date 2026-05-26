<script setup lang="ts">
import { computed, ref } from 'vue'
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

// ── Multiple field modal ───────────────────────────────────────────────────
const showModal = ref(false)
const blockCount = computed(() => Array.isArray(props.value) ? props.value.length : 0)
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
      <!-- Multiple: compact summary + open modal to edit -->
      <template v-if="isMultiple">
        <div class="flex-shrink-0 px-4 pt-2.5 pb-0.5 flex items-center gap-1">
          <span class="text-[11px] font-semibold uppercase tracking-widest text-ink-subtle leading-none">{{ field.name }}</span>
          <span v-if="field.required" class="text-amber-500 text-xs leading-none ml-0.5">*</span>
        </div>
        <button
          class="flex-1 flex flex-col items-center justify-center gap-2 px-4 pb-3 group"
          @click="showModal = true"
        >
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold text-ink">{{ blockCount }}</span>
            <span class="text-ink-muted text-sm">row{{ blockCount !== 1 ? 's' : '' }}</span>
          </div>
          <span class="inline-flex items-center gap-1 text-xs text-blue-500 group-hover:text-blue-600 transition-colors font-medium">
            Edit
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        </button>
      </template>

      <!-- All other fields: label + FieldEditor -->
      <template v-else>
        <div class="flex-shrink-0 px-4 pt-2.5 pb-0.5 flex items-center gap-1">
          <span class="text-[11px] font-semibold uppercase tracking-widest text-ink-subtle leading-none">{{ field.name }}</span>
          <span v-if="field.required" class="text-amber-500 text-xs leading-none ml-0.5">*</span>
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto px-4 pb-3">
          <FieldEditor
            :field="field"
            :value="value"
            @update:value="emit('update:value', { fieldId: field.id, value: $event })"
          />
        </div>
      </template>
    </template>

    <!-- Normal view mode -->
    <template v-else>
      <!-- Image fields -->
      <template v-if="isImage">
        <div
          v-if="showLabel && labelPosition !== 'hidden'"
          class="flex-shrink-0 px-4 pt-3 pb-1"
        >
          <span class="text-[11px] font-semibold uppercase tracking-widest text-ink-subtle leading-none">{{ field.name }}</span>
        </div>
        <div class="flex-1 min-h-0 overflow-hidden">
          <FieldRenderer :field="field" :value="value" :display-options="{ ...layoutItem.displayOptions, showLabel: false }" />
        </div>
      </template>

      <!-- Multiple: compact summary card + open modal to view -->
      <template v-else-if="isMultiple">
        <button
          class="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-3 group w-full"
          @click="showModal = true"
        >
          <div v-if="showLabel && labelPosition !== 'hidden'" class="self-start text-[11px] font-semibold uppercase tracking-widest text-ink-subtle leading-none mb-1">
            {{ field.name }}
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
            </svg>
            <span class="text-2xl font-bold text-ink">{{ blockCount }}</span>
            <span class="text-ink-muted text-sm">row{{ blockCount !== 1 ? 's' : '' }}</span>
          </div>
          <span class="inline-flex items-center gap-1 text-xs text-blue-500 group-hover:text-blue-600 transition-colors font-medium">
            View all
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        </button>
      </template>

      <!-- All other fields -->
      <div v-else class="flex-1 min-h-0 overflow-y-auto px-4 py-3">
        <FieldRenderer :field="field" :value="value" :display-options="layoutItem.displayOptions" />
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

  <!-- Multiple field modal — Teleported outside the grid cell so height is unconstrained -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showModal && isMultiple"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="showModal = false"
      >
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-blue-100">

          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-blue-50 flex-shrink-0">
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
              </svg>
              <h3 class="text-base font-semibold text-ink">{{ field.name }}</h3>
              <span class="text-xs text-ink-subtle bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                {{ blockCount }} row{{ blockCount !== 1 ? 's' : '' }}
              </span>
            </div>
            <button
              class="p-1.5 hover:bg-blue-50 rounded-lg text-ink-subtle hover:text-ink transition-colors"
              @click="showModal = false"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal body — scrollable, no height constraint -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <MultipleEditor
              v-if="recordEditable"
              :field="field"
              :value="value"
              @update:value="emit('update:value', { fieldId: field.id, value: $event })"
            />
            <MultipleField
              v-else
              :value="value"
              :referenced-class-id="field.referencedClassId"
            />
          </div>

          <!-- Modal footer -->
          <div class="px-6 py-3 border-t border-blue-50 flex justify-end flex-shrink-0">
            <button
              class="px-4 py-2 text-sm text-ink-muted hover:text-ink transition-colors"
              @click="showModal = false"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.15s ease;
}
.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.97);
}
</style>
