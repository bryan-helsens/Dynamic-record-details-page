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
import type { View } from '@/types'
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
const editingView = ref<View | null>(null)

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
  await recordStore.fetchRecord(newId)
})

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
  <div class="record-details-page min-h-screen bg-gray-50">

    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <!-- Back + breadcrumb -->
        <router-link to="/" class="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0 mr-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <nav class="flex items-center gap-1.5 text-sm text-gray-500 min-w-0">
          <span class="text-gray-400 flex-shrink-0">{{ pimClass?.name ?? '…' }}</span>
          <span class="text-gray-300">/</span>
          <span class="text-gray-800 font-semibold truncate">
            {{ record?.values[String(pimClass?.fields[0]?.id)] ?? `Record #${recordId}` }}
          </span>
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <!-- View selector -->
          <ViewSelector
            v-if="pimClass"
            :class-id="pimClass.id"
            @edit="goToBuilder"
          />

          <!-- Manage views -->
          <button
            class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Manage views"
            @click="showViewManager = true"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>

          <!-- New view -->
          <button
            v-if="pimClass"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium"
            @click="goToBuilder()"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New View
          </button>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="recordStore.loading || classStore.loading || viewStore.loading" class="flex items-center justify-center h-64">
      <LoadingSpinner label="Loading record…" />
    </div>

    <!-- Error -->
    <div v-else-if="recordStore.error" class="max-w-screen-xl mx-auto px-4 py-12 text-center">
      <p class="text-red-600 text-sm">{{ recordStore.error }}</p>
    </div>

    <!-- No view configured -->
    <div v-else-if="record && pimClass && !activeView" class="max-w-screen-xl mx-auto px-4 py-16 text-center">
      <div class="inline-flex flex-col items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-1">No view yet</h2>
          <p class="text-gray-500 text-sm">Create your first view to define how this record is displayed.</p>
        </div>
        <button
          class="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
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
        :values="record.values"
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
