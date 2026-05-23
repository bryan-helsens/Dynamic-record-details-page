<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed, createApp } from 'vue'
import { GridStack, type GridStackWidget, type GridStackNode } from 'gridstack'
import type { View, PimClass, RecordValues, LayoutItem, WidgetDisplayOptions } from '@/types'
import GridWidget from './GridWidget.vue'
import WidgetConfigPanel from './WidgetConfigPanel.vue'

const props = defineProps<{
  view: View
  pimClass: PimClass
  values: RecordValues
}>()

const emit = defineEmits<{
  (e: 'layout-change', layout: LayoutItem[]): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const layout = ref<LayoutItem[]>(props.view.layout.map((i) => ({ ...i })))
const configuringFieldId = ref<number | null>(null)

let grid: GridStack | null = null
// Track mounted Vue apps per widget so we can unmount on removal
const widgetApps = new Map<number, ReturnType<typeof createApp>>()

const availableFields = computed(() =>
  props.pimClass.fields.filter((f) => !layout.value.find((l) => l.fieldId === f.id)),
)

function getField(fieldId: number) {
  return props.pimClass.fields.find((f) => f.id === fieldId)
}

function getLayoutItem(fieldId: number) {
  return layout.value.find((l) => l.fieldId === fieldId)
}

function emitLayout() {
  emit('layout-change', layout.value.map((i) => ({ ...i })))
}

/** Mount a GridWidget Vue app into a DOM element */
function mountWidgetApp(el: HTMLElement, fieldId: number) {
  const field = getField(fieldId)
  if (!field) return

  // Unmount previous if re-mounting
  const existing = widgetApps.get(fieldId)
  if (existing) {
    existing.unmount()
    widgetApps.delete(fieldId)
  }

  const app = createApp(GridWidget, {
    field,
    layoutItem: getLayoutItem(fieldId) ?? layout.value.find((l) => l.fieldId === fieldId),
    value: props.values[String(fieldId)],
    editMode: true,
    onRemove: (id: number) => removeField(id),
    onConfigure: (id: number) => { configuringFieldId.value = id },
  })
  app.mount(el)
  widgetApps.set(fieldId, app)
}

function unmountWidgetApp(fieldId: number) {
  const app = widgetApps.get(fieldId)
  if (app) {
    app.unmount()
    widgetApps.delete(fieldId)
  }
}

function initGrid() {
  if (!containerRef.value) return
  grid?.destroy(false)

  // Unmount all existing widget apps
  widgetApps.forEach((app) => app.unmount())
  widgetApps.clear()

  grid = GridStack.init(
    {
      column: props.view.columns ?? 12,
      cellHeight: props.view.rowHeight ?? 60,
      animate: true,
      float: false,
      margin: 8,
      resizable: { handles: 'se,sw,ne,nw,e,w,s' },
    },
    containerRef.value,
  )

  // Load existing layout items
  const items: GridStackWidget[] = layout.value
    .filter((item) => getField(item.fieldId))
    .map((item) => ({
      id: String(item.fieldId),
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: item.minW ?? 2,
      minH: item.minH ?? 1,
    }))

  grid.load(items)

  // Mount Vue apps into each created cell
  nextTick(() => {
    layout.value.forEach((item) => {
      const node = grid!.engine.nodes.find((n) => n.id === String(item.fieldId))
      if (node?.el) {
        const content = node.el.querySelector('.grid-stack-item-content') as HTMLElement
        if (content) mountWidgetApp(content, item.fieldId)
      }
    })
  })

  // Track layout changes
  grid.on('change', (_event, nodes: GridStackNode[]) => {
    nodes.forEach((node) => {
      const fieldId = Number(node.id)
      const existing = layout.value.find((l) => l.fieldId === fieldId)
      if (existing) {
        existing.x = node.x ?? existing.x
        existing.y = node.y ?? existing.y
        existing.w = node.w ?? existing.w
        existing.h = node.h ?? existing.h
      }
    })
    emitLayout()
  })
}

function addField(fieldId: number) {
  if (!grid || layout.value.find((l) => l.fieldId === fieldId)) return

  const newItem: LayoutItem = {
    fieldId,
    x: 0,
    y: 0,
    w: 4,
    h: 2,
    minW: 2,
    minH: 1,
  }
  layout.value.push(newItem)

  grid.addWidget({
    id: String(fieldId),
    w: 4,
    h: 2,
    minW: 2,
    minH: 1,
  })

  nextTick(() => {
    const node = grid!.engine.nodes.find((n) => n.id === String(fieldId))
    if (node) {
      newItem.x = node.x ?? 0
      newItem.y = node.y ?? 0
      if (node.el) {
        const content = node.el.querySelector('.grid-stack-item-content') as HTMLElement
        if (content) mountWidgetApp(content, fieldId)
      }
    }
    emitLayout()
  })
}

function removeField(fieldId: number) {
  if (!grid) return
  const node = grid.engine.nodes.find((n) => n.id === String(fieldId))
  if (node?.el) grid.removeWidget(node.el)
  unmountWidgetApp(fieldId)
  layout.value = layout.value.filter((l) => l.fieldId !== fieldId)
  emitLayout()
}

function updateDisplayOptions(fieldId: number, options: WidgetDisplayOptions) {
  const item = layout.value.find((l) => l.fieldId === fieldId)
  if (item) {
    item.displayOptions = { ...item.displayOptions, ...options }
    // Re-mount widget with updated props
    const node = grid?.engine.nodes.find((n) => n.id === String(fieldId))
    if (node?.el) {
      const content = node.el.querySelector('.grid-stack-item-content') as HTMLElement
      if (content) mountWidgetApp(content, fieldId)
    }
    emitLayout()
  }
}

function onDragStart(event: DragEvent, fieldId: number) {
  if (!event.dataTransfer) return
  event.dataTransfer.setData('text/plain', String(fieldId))
  event.dataTransfer.effectAllowed = 'copy'
}

onMounted(async () => {
  await nextTick()
  initGrid()
})

onBeforeUnmount(() => {
  widgetApps.forEach((app) => app.unmount())
  widgetApps.clear()
  grid?.destroy(false)
})

watch(
  () => props.view.id,
  async () => {
    layout.value = props.view.layout.map((i) => ({ ...i }))
    await nextTick()
    initGrid()
  },
)

// Update widget values when record values change
watch(
  () => props.values,
  () => {
    layout.value.forEach((item) => {
      const node = grid?.engine.nodes.find((n) => n.id === String(item.fieldId))
      if (node?.el) {
        const content = node.el.querySelector('.grid-stack-item-content') as HTMLElement
        if (content) mountWidgetApp(content, item.fieldId)
      }
    })
  },
  { deep: true },
)
</script>

<template>
  <div class="grid-builder flex gap-4 h-full">

    <!-- Sidebar: available fields -->
    <aside class="w-56 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
      <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 px-1">Fields</h3>

      <div
        v-if="availableFields.length === 0"
        class="text-xs text-gray-400 px-2 py-3 text-center border border-dashed border-gray-300 rounded"
      >
        All fields added
      </div>

      <div
        v-for="field in availableFields"
        :key="field.id"
        class="field-chip flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-grab shadow-sm hover:border-brand-400 hover:shadow-md transition-all select-none"
        draggable="true"
        :title="`Click or drag to add ${field.name}`"
        @dragstart="onDragStart($event, field.id)"
        @click="addField(field.id)"
      >
        <span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase font-mono font-medium flex-shrink-0">
          {{ field.type.slice(0, 3) }}
        </span>
        <span class="text-sm text-gray-800 truncate">{{ field.name }}</span>
        <svg class="w-3.5 h-3.5 text-gray-400 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </div>

      <!-- In-layout listing -->
      <div v-if="layout.length" class="mt-2 pt-3 border-t border-gray-200">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-400 px-1 mb-1.5">In layout</h4>
        <div
          v-for="item in layout"
          :key="item.fieldId"
          class="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-50 group"
        >
          <span class="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
          <span class="truncate flex-1">{{ getField(item.fieldId)?.name }}</span>
          <button
            class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
            @click="removeField(item.fieldId)"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Grid canvas -->
    <div class="flex-1 min-w-0 flex flex-col">
      <div
        ref="containerRef"
        class="grid-stack flex-1 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 min-h-[400px] p-2"
      />
    </div>

    <!-- Widget config panel -->
    <Teleport to="body">
      <WidgetConfigPanel
        v-if="configuringFieldId !== null && getField(configuringFieldId) && getLayoutItem(configuringFieldId)"
        :field="getField(configuringFieldId)!"
        :layout-item="getLayoutItem(configuringFieldId)!"
        @close="configuringFieldId = null"
        @update="updateDisplayOptions(configuringFieldId!, $event)"
      />
    </Teleport>
  </div>
</template>
