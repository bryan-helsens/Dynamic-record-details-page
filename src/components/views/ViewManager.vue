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

async function setDefault(view: View) {
  await viewStore.setDefaultView(props.classId, view.id)
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click.self="emit('close')">
    <div class="bg-white rounded-xl shadow-xl w-[480px] border border-blue-100">
      <div class="flex items-center justify-between px-6 py-4 border-b border-blue-50">
        <h2 class="text-lg font-semibold text-ink">Manage Views</h2>
        <button class="text-ink-subtle hover:text-ink transition-colors" @click="emit('close')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Create new view -->
      <div class="px-6 py-4 border-b border-blue-50">
        <label class="block text-xs font-medium text-ink-muted mb-1.5">Create new view</label>
        <div class="flex gap-2">
          <input
            v-model="newViewName"
            type="text"
            placeholder="View name…"
            class="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @keyup.enter="createView"
          />
          <button
            class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
            :disabled="!newViewName.trim() || creating"
            @click="createView"
          >
            Create
          </button>
        </div>
      </div>

      <!-- Existing views -->
      <div class="max-h-72 overflow-y-auto divide-y divide-blue-50">
        <div v-if="views.length === 0" class="px-6 py-8 text-center text-sm text-ink-subtle">
          No views yet. Create your first view above.
        </div>

        <div
          v-for="view in views"
          :key="view.id"
          class="flex items-center gap-3 px-6 py-3 hover:bg-blue-50 group transition-colors"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-ink truncate">{{ view.name }}</p>
            <p class="text-xs text-ink-subtle">{{ view.layout.length }} field{{ view.layout.length !== 1 ? 's' : '' }}</p>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <!-- Default star -->
            <button
              class="p-1.5 rounded transition-colors"
              :class="view.isDefault
                ? 'text-amber-400 hover:text-amber-500'
                : 'text-ink-subtle hover:text-amber-400'"
              :title="view.isDefault ? 'Default view' : 'Set as default'"
              @click="setDefault(view)"
            >
              <svg class="w-4 h-4" :fill="view.isDefault ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button
              class="p-1.5 hover:bg-blue-100 rounded text-ink-muted hover:text-ink transition-colors"
              title="Edit layout"
              @click="emit('edit', view)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              class="p-1.5 hover:bg-blue-100 rounded text-ink-muted hover:text-ink transition-colors"
              title="Duplicate"
              @click="duplicateView(view)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              class="p-1.5 hover:bg-red-100 rounded text-ink-muted hover:text-red-600 transition-colors"
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

      <div class="px-6 py-4 border-t border-blue-50 flex justify-end">
        <button
          class="px-4 py-2 text-sm text-ink-muted hover:text-ink transition-colors"
          @click="emit('close')"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>
