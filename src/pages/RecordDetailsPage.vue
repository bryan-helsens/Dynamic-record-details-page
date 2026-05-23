<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecordStore } from '@/stores/recordStore'
import { useClassStore } from '@/stores/classStore'
import { useViewStore } from '@/stores/viewStore'
import GridViewer from '@/components/grid/GridViewer.vue'
import ViewSelector from '@/components/views/ViewSelector.vue'
import ViewManager from '@/components/views/ViewManager.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { View, RecordValues } from '@/types'
import type AppToast from '@/components/common/AppToast.vue'

const route = useRoute()
const router = useRouter()
const recordStore = useRecordStore()
const classStore = useClassStore()
const viewStore = useViewStore()
const toast = inject<InstanceType<typeof AppToast>>('toast')

const recordId = computed(() => Number(route.params.recordId))
const record = computed(() => recordStore.getById(recordId.value))
const pimClass = computed(() => record.value ? classStore.getById(record.value.classId) : undefined)
const activeView = computed(() => viewStore.activeView)
const showViewManager = ref(false)

// ── Edit mode ──────────────────────────────────────────────────────────────
const isEditing = ref(false)
const draftValues = ref<RecordValues>({})

function startEdit() {
  draftValues.value = { ...(record.value?.values ?? {}) }
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  draftValues.value = {}
}

const displayValues = computed(() =>
  isEditing.value ? draftValues.value : (record.value?.values ?? {}),
)

function onFieldValueUpdate({ fieldId, value }: { fieldId: number; value: unknown }) {
  draftValues.value[String(fieldId)] = value
}

const hasChanges = computed(() => {
  if (!isEditing.value || !record.value) return false
  return JSON.stringify(draftValues.value) !== JSON.stringify(record.value.values)
})

async function saveRecord() {
  if (!record.value) return
  const result = await recordStore.updateRecord(record.value.id, draftValues.value)
  if (result) {
    isEditing.value = false
    draftValues.value = {}
    toast?.add({ type: 'success', message: 'Record saved' })
  } else {
    toast?.add({ type: 'error', message: recordStore.error ?? 'Failed to save record' })
  }
}

// ── Required field validation ──────────────────────────────────────────────
const missingRequiredCount = computed(() => {
  if (!pimClass.value || !activeView.value || !record.value) return 0
  const values = isEditing.value ? draftValues.value : record.value.values
  return pimClass.value.fields.filter((f) => {
    if (!f.required) return false
    if (!activeView.value!.layout.some((l) => l.fieldId === f.id)) return false
    const v = values[String(f.id)]
    return v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
  }).length
})

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  await recordStore.fetchRecord(recordId.value)
  if (record.value) {
    await Promise.all([
      classStore.fetchOne(record.value.classId),
      viewStore.fetchViewsForClass(record.value.classId),
    ])
  }
})

watch(recordId, async (newId) => {
  isEditing.value = false
  await recordStore.fetchRecord(newId)
})

// ── Navigation ─────────────────────────────────────────────────────────────
function goToBuilder(viewId?: number) {
  if (viewId) {
    router.push({ name: 'view-builder', params: { classId: pimClass.value?.id, viewId } })
  } else {
    router.push({ name: 'view-builder', params: { classId: pimClass.value?.id, viewId: 'new' } })
  }
}

function handleEditView(view: View) {
  showViewManager.value = false
  goToBuilder(view.id)
}
</script>

<template>
  <div class="record-details-page min-h-screen bg-surface-page">

    <!-- Header -->
    <header class="sticky top-0 z-20 bg-ink shadow-sm">
      <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <router-link to="/" class="text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0 mr-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <nav class="flex items-center gap-1.5 text-sm min-w-0">
          <span class="text-blue-300 flex-shrink-0">{{ pimClass?.name ?? '…' }}</span>
          <span class="text-blue-700">/</span>
          <span class="text-white font-semibold truncate">
            {{ record?.values[String(pimClass?.fields[0]?.id)] ?? `Record #${recordId}` }}
          </span>
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <ViewSelector v-if="pimClass && !isEditing" :class-id="pimClass.id" @edit="goToBuilder" />

          <!-- Missing required badge -->
          <span
            v-if="missingRequiredCount > 0"
            class="flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs rounded-lg font-medium flex-shrink-0"
            :title="`${missingRequiredCount} required field${missingRequiredCount > 1 ? 's' : ''} missing`"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ missingRequiredCount }} required
          </span>

          <!-- Edit mode actions -->
          <template v-if="isEditing">
            <button
              class="px-3 py-1.5 text-sm text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              @click="cancelEdit"
            >
              Cancel
            </button>
            <button
              class="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 disabled:opacity-60 transition-colors font-medium"
              :disabled="recordStore.saving || !hasChanges"
              @click="saveRecord"
            >
              <svg v-if="recordStore.saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ recordStore.saving ? 'Saving…' : 'Save' }}
            </button>
          </template>

          <!-- View mode actions -->
          <template v-else>
            <button
              v-if="record && pimClass && activeView"
              class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Edit record values"
              @click="startEdit"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>

            <button
              class="p-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Manage views"
              @click="showViewManager = true"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>

            <button
              v-if="pimClass"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors font-medium"
              @click="goToBuilder()"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New View
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- Blue accent line -->
    <div class="h-0.5 bg-blue-600" />

    <!-- Edit mode banner -->
    <div
      v-if="isEditing"
      class="bg-blue-600 text-white text-xs text-center py-1.5 font-medium tracking-wide"
    >
      Editing record — click any field to change its value
    </div>

    <!-- Loading -->
    <div v-if="recordStore.loading || classStore.loading || viewStore.loading" class="flex items-center justify-center h-64">
      <LoadingSpinner label="Loading record…" />
    </div>

    <!-- Error -->
    <div v-else-if="recordStore.error" class="max-w-screen-xl mx-auto px-4 py-12 text-center">
      <p class="text-red-600 text-sm">{{ recordStore.error }}</p>
    </div>

    <!-- No view configured -->
    <div v-else-if="record && pimClass && !activeView" class="max-w-screen-xl mx-auto px-4 py-20 text-center">
      <div class="inline-flex flex-col items-center gap-5">
        <div class="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-ink mb-1">No view yet</h2>
          <p class="text-ink-muted text-sm">Create your first view to define how this record is displayed.</p>
        </div>
        <button
          class="px-6 py-2.5 bg-ink text-white rounded-lg hover:bg-ink-light transition-colors font-medium text-sm"
          @click="goToBuilder()"
        >
          Create a View
        </button>
      </div>
    </div>

    <!-- Record content -->
    <main v-else-if="record && pimClass && activeView" class="max-w-screen-xl mx-auto px-5 sm:px-7 lg:px-10 py-7">
      <GridViewer
        :view="activeView"
        :pim-class="pimClass"
        :values="displayValues"
        :editable="isEditing"
        @update:field-value="onFieldValueUpdate"
      />
    </main>

    <!-- View manager modal -->
    <Teleport to="body">
      <ViewManager
        v-if="showViewManager && pimClass"
        :class-id="pimClass.id"
        @close="showViewManager = false"
        @edit="handleEditView"
      />
    </Teleport>
  </div>
</template>
