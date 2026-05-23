<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClassStore } from '@/stores/classStore'
import { useViewStore } from '@/stores/viewStore'
import { useRecordStore } from '@/stores/recordStore'
import GridBuilder from '@/components/grid/GridBuilder.vue'
import GridViewer from '@/components/grid/GridViewer.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { LayoutItem } from '@/types'
import type AppToast from '@/components/common/AppToast.vue'
import { recordsApi } from '@/api'

const route = useRoute()
const router = useRouter()
const classStore = useClassStore()
const viewStore = useViewStore()
const recordStore = useRecordStore()
const toast = inject<InstanceType<typeof AppToast>>('toast')

const classId = computed(() => Number(route.params.classId))
const viewId = computed(() => route.params.viewId === 'new' ? null : Number(route.params.viewId))
const isNew = computed(() => viewId.value === null)

const view = computed(() =>
  viewId.value !== null ? viewStore.views.find((v) => v.id === viewId.value) : null,
)
const pimClass = computed(() => classStore.getById(classId.value))

// Demo values for preview while building
const previewRecord = computed(() => recordStore.records.values().next().value ?? null)
const previewValues = computed(() => previewRecord.value?.values ?? {})

const viewName = ref('')
const viewDescription = ref('')
const currentLayout = ref<LayoutItem[]>([])
const columns = ref(12)
const rowHeight = ref(60)
const hasUnsavedChanges = ref(false)
const previewMode = ref(false)
const showGridSettings = ref(false)
const builderKey = ref(0)

// Undo / redo stacks (each entry is a deep copy of the layout)
const undoStack = ref<LayoutItem[][]>([])
const redoStack = ref<LayoutItem[][]>([])
const canUndo = computed(() => undoStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  await Promise.all([
    classStore.fetchOne(classId.value),
    viewStore.fetchViewsForClass(classId.value),
    // Load first record of this class so the builder can show real preview values
    recordsApi.listByClass(classId.value).then((records) => {
      records.forEach((r) => recordStore.records.set(r.id, r))
    }).catch(() => { /* preview values are optional */ }),
  ])
})

// Sync form state whenever the resolved view changes (handles async load)
watch(
  view,
  (newView) => {
    if (newView) {
      viewName.value = newView.name
      viewDescription.value = newView.description ?? ''
      // Only overwrite layout if we haven't made local edits yet
      if (!hasUnsavedChanges.value) {
        currentLayout.value = newView.layout.map((l) => ({ ...l }))
        columns.value = newView.columns ?? 12
        rowHeight.value = newView.rowHeight ?? 60
      }
      // Bump the key so GridBuilder re-mounts with the full populated layout
      builderKey.value++
    } else if (isNew.value) {
      viewName.value = 'New View'
    }
  },
  { immediate: true },
)

function onLayoutChange(layout: LayoutItem[]) {
  // Push current layout to undo stack before accepting the change
  undoStack.value.push(currentLayout.value.map((i) => ({ ...i })))
  if (undoStack.value.length > 50) undoStack.value.shift()
  redoStack.value = []

  currentLayout.value = layout
  hasUnsavedChanges.value = true
  if (view.value) {
    viewStore.updateLayoutInMemory(view.value.id, layout)
  }
}

function undo() {
  if (!canUndo.value) return
  redoStack.value.push(currentLayout.value.map((i) => ({ ...i })))
  currentLayout.value = undoStack.value.pop()!
  builderKey.value++
  hasUnsavedChanges.value = true
}

function redo() {
  if (!canRedo.value) return
  undoStack.value.push(currentLayout.value.map((i) => ({ ...i })))
  currentLayout.value = redoStack.value.pop()!
  builderKey.value++
  hasUnsavedChanges.value = true
}

function onKeydown(e: KeyboardEvent) {
  const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    save()
  }
  if (isTyping) return
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    redo()
  }
}

async function save() {
  if (!viewName.value.trim()) {
    toast?.add({ type: 'error', message: 'View name is required' })
    return
  }

  if (isNew.value) {
    const created = await viewStore.createView({
      name: viewName.value.trim(),
      description: viewDescription.value.trim() || undefined,
      classId: classId.value,
      layout: currentLayout.value,
      columns: columns.value,
      rowHeight: rowHeight.value,
    })
    if (created) {
      hasUnsavedChanges.value = false
      toast?.add({ type: 'success', message: 'View created successfully' })
      router.replace({
        name: 'view-builder',
        params: { classId: classId.value, viewId: created.id },
      })
    } else {
      toast?.add({ type: 'error', message: viewStore.error ?? 'Failed to create view' })
    }
  } else if (view.value) {
    const updated = await viewStore.saveView({
      id: view.value.id,
      name: viewName.value.trim(),
      description: viewDescription.value.trim() || undefined,
      layout: currentLayout.value,
      columns: columns.value,
      rowHeight: rowHeight.value,
    })
    if (updated) {
      hasUnsavedChanges.value = false
      toast?.add({ type: 'success', message: 'View saved' })
    } else {
      toast?.add({ type: 'error', message: viewStore.error ?? 'Failed to save view' })
    }
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

function goBack() {
  if (hasUnsavedChanges.value) {
    if (!confirm('You have unsaved changes. Discard them?')) return
  }
  router.back()
}
</script>

<template>
  <div class="view-builder-page min-h-screen bg-surface-page flex flex-col">

    <!-- Builder Header -->
    <header class="flex-shrink-0 bg-ink border-b border-ink-light shadow-sm z-20">
      <div class="h-14 px-4 flex items-center gap-4">
        <button
          class="flex items-center gap-1.5 text-sm text-blue-300 hover:text-white transition-colors"
          @click="goBack"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div class="h-5 w-px bg-blue-800" />

        <!-- View name inline edit -->
        <input
          v-model="viewName"
          type="text"
          class="text-base font-semibold text-white bg-transparent border-0 border-b border-transparent hover:border-blue-700 focus:border-blue-500 focus:outline-none px-1 py-0.5 transition-colors placeholder:text-blue-700"
          placeholder="View name…"
        />

        <span
          v-if="hasUnsavedChanges"
          class="text-xs text-yellow-400 bg-yellow-900/40 px-2 py-0.5 rounded-full border border-yellow-700"
        >
          Unsaved
        </span>

        <div class="ml-auto flex items-center gap-2">
          <!-- Undo / Redo -->
          <div class="flex items-center gap-0.5">
            <button
              class="p-2 rounded-lg transition-colors"
              :class="canUndo ? 'text-blue-300 hover:text-white hover:bg-white/10' : 'text-blue-800 cursor-not-allowed'"
              :disabled="!canUndo"
              title="Undo (Ctrl+Z)"
              @click="undo"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              class="p-2 rounded-lg transition-colors"
              :class="canRedo ? 'text-blue-300 hover:text-white hover:bg-white/10' : 'text-blue-800 cursor-not-allowed'"
              :disabled="!canRedo"
              title="Redo (Ctrl+Y)"
              @click="redo"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
              </svg>
            </button>
          </div>

          <div class="h-5 w-px bg-blue-800" />

          <!-- Grid settings -->
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            @click="showGridSettings = !showGridSettings"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Grid
          </button>

          <!-- Preview toggle -->
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors"
            :class="previewMode ? 'bg-blue-600 text-white' : 'text-blue-300 hover:text-white hover:bg-white/10'"
            @click="previewMode = !previewMode"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </button>

          <!-- Save -->
          <button
            class="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 disabled:opacity-60 transition-colors font-medium"
            :disabled="viewStore.saving"
            @click="save"
          >
            <svg v-if="viewStore.saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ viewStore.saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>

      <!-- Grid settings panel -->
      <Transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="showGridSettings" class="border-t border-ink-light px-4 py-3 bg-ink-light flex items-center gap-6 text-sm">
          <div class="flex items-center gap-2">
            <label class="text-blue-300 text-xs font-medium">Columns</label>
            <select
              v-model.number="columns"
              class="border border-blue-800 bg-ink rounded px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500"
              @change="hasUnsavedChanges = true"
            >
              <option value="6">6 columns</option>
              <option value="12">12 columns</option>
              <option value="24">24 columns</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-blue-300 text-xs font-medium">Row height (px)</label>
            <input
              v-model.number="rowHeight"
              type="number"
              min="30"
              max="200"
              step="10"
              class="w-20 border border-blue-800 bg-ink rounded px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500"
              @change="hasUnsavedChanges = true"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-blue-300 text-xs font-medium">Description</label>
            <input
              v-model="viewDescription"
              type="text"
              placeholder="Optional…"
              class="w-48 border border-blue-800 bg-ink rounded px-2 py-1 text-sm text-white placeholder:text-blue-800 focus:ring-2 focus:ring-blue-500"
              @input="hasUnsavedChanges = true"
            />
          </div>
        </div>
      </Transition>
    </header>

    <!-- Blue accent line -->
    <div class="h-0.5 bg-blue-600 flex-shrink-0" />

    <!-- Main builder area -->
    <div class="flex-1 overflow-auto">
      <div v-if="classStore.loading || viewStore.loading" class="flex items-center justify-center h-64">
        <LoadingSpinner label="Loading…" />
      </div>

      <div v-else-if="!pimClass" class="flex items-center justify-center h-64 text-ink-subtle text-sm">
        Class not found
      </div>

      <div v-else class="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <GridBuilder
          v-if="!previewMode"
          :key="builderKey"
          :view="{
            id: view?.id ?? 0,
            name: viewName,
            classId: classId,
            layout: currentLayout,
            columns: columns,
            rowHeight: rowHeight,
          }"
          :pim-class="pimClass"
          :values="previewValues"
          @layout-change="onLayoutChange"
        />

        <!-- Preview mode -->
        <div v-else>
          <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            Preview mode — showing layout with sample data. Click "Preview" again to return to editing.
          </div>
          <GridViewer
            :view="{
              id: view?.id ?? 0,
              name: viewName,
              classId: classId,
              layout: currentLayout,
              columns: columns,
              rowHeight: rowHeight,
            }"
            :pim-class="pimClass"
            :values="previewValues"
          />

        </div>
      </div>
    </div>
  </div>
</template>
