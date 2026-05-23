<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClassStore } from '@/stores/classStore'
import { useViewStore } from '@/stores/viewStore'
import { useRecordStore } from '@/stores/recordStore'
import GridBuilder from '@/components/grid/GridBuilder.vue'
import GridViewer from '@/components/grid/GridViewer.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { LayoutItem } from '@/types'
import type AppToast from '@/components/common/AppToast.vue'

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

onMounted(async () => {
  await classStore.fetchOne(classId.value)
  await viewStore.fetchViewsForClass(classId.value)

  if (view.value) {
    viewName.value = view.value.name
    viewDescription.value = view.value.description ?? ''
    currentLayout.value = view.value.layout.map((l) => ({ ...l }))
    columns.value = view.value.columns ?? 12
    rowHeight.value = view.value.rowHeight ?? 60
  } else {
    viewName.value = 'New View'
  }
})

function onLayoutChange(layout: LayoutItem[]) {
  currentLayout.value = layout
  hasUnsavedChanges.value = true
  if (view.value) {
    viewStore.updateLayoutInMemory(view.value.id, layout)
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

function goBack() {
  if (hasUnsavedChanges.value) {
    if (!confirm('You have unsaved changes. Discard them?')) return
  }
  router.back()
}
</script>

<template>
  <div class="view-builder-page min-h-screen bg-gray-100 flex flex-col">

    <!-- Builder Header -->
    <header class="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-20">
      <div class="h-14 px-4 flex items-center gap-4">
        <button
          class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          @click="goBack"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div class="h-5 w-px bg-gray-200" />

        <!-- View name inline edit -->
        <input
          v-model="viewName"
          type="text"
          class="text-base font-semibold text-gray-900 bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-brand-500 focus:outline-none px-1 py-0.5 transition-colors"
          placeholder="View name…"
        />

        <span
          v-if="hasUnsavedChanges"
          class="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200"
        >
          Unsaved
        </span>

        <div class="ml-auto flex items-center gap-2">
          <!-- Grid settings -->
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
            :class="previewMode ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'"
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
            class="flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-60 transition-colors font-medium"
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
        <div v-if="showGridSettings" class="border-t border-gray-100 px-4 py-3 bg-gray-50 flex items-center gap-6 text-sm">
          <div class="flex items-center gap-2">
            <label class="text-gray-600 text-xs font-medium">Columns</label>
            <select
              v-model.number="columns"
              class="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-500"
              @change="hasUnsavedChanges = true"
            >
              <option value="6">6 columns</option>
              <option value="12">12 columns</option>
              <option value="24">24 columns</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label class="text-gray-600 text-xs font-medium">Row height (px)</label>
            <input
              v-model.number="rowHeight"
              type="number"
              min="30"
              max="200"
              step="10"
              class="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-500"
              @change="hasUnsavedChanges = true"
            />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-gray-600 text-xs font-medium">Description</label>
            <input
              v-model="viewDescription"
              type="text"
              placeholder="Optional…"
              class="w-48 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-500"
              @input="hasUnsavedChanges = true"
            />
          </div>
        </div>
      </Transition>
    </header>

    <!-- Main builder area -->
    <div class="flex-1 overflow-auto">
      <div v-if="classStore.loading || viewStore.loading" class="flex items-center justify-center h-64">
        <LoadingSpinner label="Loading…" />
      </div>

      <div v-else-if="!pimClass" class="flex items-center justify-center h-64 text-gray-400 text-sm">
        Class not found
      </div>

      <div v-else class="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 h-full">
        <GridBuilder
          v-if="!previewMode"
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
