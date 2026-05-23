<script setup lang="ts">
/**
 * Read-only view renderer.
 * Uses CSS Grid for pixel-perfect layout matching the saved view config.
 * No external library needed for static display — avoids GridStack DOM timing issues.
 */
import { computed } from 'vue'
import type { View, PimClass, RecordValues } from '@/types'
import GridWidget from './GridWidget.vue'

const props = defineProps<{
  view: View
  pimClass: PimClass
  values: RecordValues
}>()

const columns = computed(() => props.view.columns ?? 12)
const rowHeight = computed(() => props.view.rowHeight ?? 60)
const gap = 8

function getField(fieldId: number) {
  return props.pimClass.fields.find((f) => f.id === fieldId)
}

/**
 * Build a flat CSS Grid style string for the container.
 * Each layout item is placed using grid-column / grid-row.
 */
function itemStyle(item: { x: number; y: number; w: number; h: number }) {
  return {
    gridColumn: `${item.x + 1} / span ${item.w}`,
    gridRow: `${item.y + 1} / span ${item.h}`,
    height: `${item.h * rowHeight.value + (item.h - 1) * gap}px`,
  }
}

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
  gap: `${gap}px`,
}))

const visibleItems = computed(() =>
  props.view.layout.filter((item) => getField(item.fieldId)),
)
</script>

<template>
  <div class="grid-viewer" :style="gridStyle">
    <div
      v-for="item in visibleItems"
      :key="item.fieldId"
      :style="itemStyle(item)"
    >
      <GridWidget
        :field="getField(item.fieldId)!"
        :layout-item="item"
        :value="values[String(item.fieldId)]"
        :edit-mode="false"
      />
    </div>
  </div>
</template>
