<script setup lang="ts">
import { ref, computed } from 'vue'
import { useViewStore } from '@/stores/viewStore'
import type { View } from '@/types'

const props = defineProps<{ classId: number }>()
const emit = defineEmits<{
  (e: 'edit', view: View): void
  (e: 'close'): void
}>()

const viewStore = useViewStore()
const newViewName = ref('')
const creating = ref(false)
const deletingId = ref<number | null>(null)

const views = computed(() => viewStore.byClass(props.classId))

async function createView() {
  if (!newViewName.value.trim()) return
  creating.value = true
  await viewStore.createView({
    name: newViewName.value.trim(),
    classId: props.classId,
    layout: [],
  })
  newViewName.value = ''
  creating.value = false
}

async function deleteView(id: number) {
  if (!confirm('Delete this view?')) return
  deletingId.value = id
  await viewStore.deleteView(id)
  deletingId.value = null
}

async function duplicateView(view: View) {
  await viewStore.duplicateView(view.id, `${view.name} (copy)`)
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" @click.self="emit('close')">
    <div class="bg-white rounded-xl shadow-xl w-[480px] border border-gray-200">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900">Manage Views</h2>
        <button class="text-gray-400 hover:text-gray-700" @click="emit('close')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Create new view -->
      <div class="px-6 py-4 border-b border-gray-100">
        <label class="block text-xs font-medium text-gray-600 mb-1.5">Create new view</label>
        <div class="flex gap-2">
          <input
            v-model="newViewName"
            type="text"
            placeholder="View name…"
            class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            @keyup.enter="createView"
          />
          <button
            class="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            :disabled="!newViewName.trim() || creating"
            @click="createView"
          >
            Create
          </button>
        </div>
      </div>

      <!-- Existing views -->
      <div class="max-h-72 overflow-y-auto divide-y divide-gray-100">
        <div v-if="views.length === 0" class="px-6 py-8 text-center text-sm text-gray-400">
          No views yet. Create your first view above.
        </div>

        <div
          v-for="view in views"
          :key="view.id"
          class="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 group transition-colors"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ view.name }}</p>
            <p class="text-xs text-gray-400">{{ view.layout.length }} field{{ view.layout.length !== 1 ? 's' : '' }}</p>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              class="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 transition-colors"
              title="Edit layout"
              @click="emit('edit', view)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              class="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 transition-colors"
              title="Duplicate"
              @click="duplicateView(view)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              class="p-1.5 hover:bg-red-100 rounded text-gray-500 hover:text-red-600 transition-colors"
              :disabled="deletingId === view.id"
              title="Delete"
              @click="deleteView(view.id)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-100 flex justify-end">
        <button
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          @click="emit('close')"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>
