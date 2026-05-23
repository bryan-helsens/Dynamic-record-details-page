<script setup lang="ts">
/**
 * Read-only view renderer using CSS Grid.
 * Mirrors the GridStack coordinate system exactly:
 *   - grid-template-columns: N equal columns
 *   - grid-template-rows: explicit fixed-height rows so y positions are respected
 *   - Each item placed via grid-column / grid-row spanning
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
const gap = 10

const visibleItems = computed(() =>
  props.view.layout.filter((item) => getField(item.fieldId)),
)

// Total rows needed = max(y + h) across all items
const totalRows = computed(() => {
  if (!visibleItems.value.length) return 1
  return Math.max(...visibleItems.value.map((i) => i.y + i.h))
})

function getField(fieldId: number) {
  return props.pimClass.fields.find((f) => f.id === fieldId)
}

function itemStyle(item: { x: number; y: number; w: number; h: number }) {
  return {
    gridColumn: `${item.x + 1} / span ${item.w}`,
    gridRow: `${item.y + 1} / span ${item.h}`,
  }
}

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
  // Explicit row heights so items at y>0 aren't ignored
  gridTemplateRows: `repeat(${totalRows.value}, ${rowHeight.value}px)`,
  gap: `${gap}px`,
}))
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
