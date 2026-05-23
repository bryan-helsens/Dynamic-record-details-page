<script setup lang="ts">
import { ref } from 'vue'
import type { Notification } from '@/types'

const notifications = ref<Notification[]>([])

function add(n: Omit<Notification, 'id'>) {
  const id = crypto.randomUUID()
  notifications.value.push({ ...n, id })
  setTimeout(() => remove(id), n.timeout ?? 4000)
}

function remove(id: string) {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}

defineExpose({ add })
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <TransitionGroup
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="n in notifications"
        :key="n.id"
        class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm max-w-xs"
        :class="{
          'bg-green-50 border-green-200 text-green-800': n.type === 'success',
          'bg-red-50 border-red-200 text-red-800': n.type === 'error',
          'bg-blue-50 border-blue-200 text-blue-800': n.type === 'info',
          'bg-yellow-50 border-yellow-200 text-yellow-800': n.type === 'warning',
        }"
      >
        <span class="flex-1">{{ n.message }}</span>
        <button class="opacity-60 hover:opacity-100" @click="remove(n.id)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
