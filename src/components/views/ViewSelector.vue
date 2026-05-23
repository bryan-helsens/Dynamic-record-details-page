<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useViewStore } from '@/stores/viewStore'

const props = defineProps<{ classId: number }>()
const emit = defineEmits<{ (e: 'edit', viewId: number): void }>()

const viewStore = useViewStore()
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function onClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))

const views = computed(() => viewStore.byClass(props.classId))
const active = computed(() => viewStore.activeView)

function select(id: number) {
  viewStore.setActiveView(id)
  open.value = false
}
</script>

<template>
  <div ref="rootRef" class="view-selector relative">
    <button
      class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
      @click="open = !open"
    >
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
      <span class="font-medium text-gray-900">{{ active?.name ?? 'Select view' }}</span>
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden"
      >
        <div v-if="views.length === 0" class="px-4 py-3 text-sm text-gray-400 text-center">
          No views yet
        </div>

        <button
          v-for="view in views"
          :key="view.id"
          class="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left group"
          :class="{ 'bg-brand-50 text-brand-700 font-medium': view.id === active?.id }"
          @click="select(view.id)"
        >
          <span class="truncate">{{ view.name }}</span>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
            <button
              class="p-1 hover:bg-gray-200 rounded text-gray-500"
              title="Edit view"
              @click.stop="emit('edit', view.id)"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </button>
      </div>
    </Transition>
  </div>
</template>
