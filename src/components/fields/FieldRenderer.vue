<script setup lang="ts">
import { defineAsyncComponent, computed, type Component } from 'vue'
import type { Field, WidgetDisplayOptions } from '@/types'

const props = defineProps<{
  field: Field
  value: unknown
  displayOptions?: WidgetDisplayOptions
}>()

const componentMap: Record<string, () => Promise<Component>> = {
  text: () => import('./TextField.vue'),
  textarea: () => import('./TextareaField.vue'),
  number: () => import('./NumberField.vue'),
  date: () => import('./DateField.vue'),
  datetime: () => import('./DateField.vue'),
  boolean: () => import('./BooleanField.vue'),
  image: () => import('./ImageField.vue'),
  relation: () => import('./RelationField.vue'),
  select: () => import('./SelectField.vue'),
  multiselect: () => import('./SelectField.vue'),
  url: () => import('./UrlField.vue'),
  email: () => import('./UrlField.vue'),
  color: () => import('./ColorField.vue'),
  multiple: () => import('./MultipleField.vue'),
}

const FieldComponent = computed(() =>
  defineAsyncComponent({
    loader: componentMap[props.field.type] ?? componentMap['text'],
    loadingComponent: { template: '<div class="animate-pulse h-4 bg-gray-200 rounded w-24" />' },
    errorComponent: { template: '<span class="text-red-500 text-xs">Render error</span>' },
  }),
)

const labelPositionClass = computed(() => {
  switch (props.displayOptions?.labelPosition ?? 'top') {
    case 'left': return 'flex-row items-center gap-3'
    case 'hidden': return 'flex-col'
    default: return 'flex-col gap-1'
  }
})

const fontSizeClass = computed(() => {
  switch (props.displayOptions?.fontSize ?? 'md') {
    case 'sm': return 'text-sm'
    case 'lg': return 'text-lg'
    case 'xl': return 'text-xl'
    default: return 'text-base'
  }
})
</script>

<template>
  <div class="field-renderer h-full flex" :class="[labelPositionClass, fontSizeClass]">
    <label
      v-if="displayOptions?.labelPosition !== 'hidden' && (displayOptions?.showLabel !== false)"
      class="field-label text-[11px] font-semibold uppercase tracking-widest text-gray-400 flex-shrink-0 leading-none mb-0.5"
    >
      {{ field.name }}
    </label>
    <div class="field-value flex-1 min-h-0 overflow-hidden">
      <component
        :is="FieldComponent"
        :value="value"
        :type="field.type"
        :options="field.options"
        :referenced-class-id="field.referencedClassId"
      />
    </div>
  </div>
</template>
