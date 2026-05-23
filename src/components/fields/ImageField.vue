<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ value: unknown }>()
const errored = ref(false)
const src = typeof props.value === 'string' ? props.value : null
</script>

<template>
  <div class="w-full h-full flex items-center justify-center bg-gray-50 rounded overflow-hidden">
    <img
      v-if="src && !errored"
      :src="src"
      :alt="src"
      class="max-w-full max-h-full object-contain"
      @error="errored = true"
    />
    <div v-else-if="src && errored" class="text-xs text-gray-400 text-center px-2">
      <svg class="w-8 h-8 mx-auto mb-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Image unavailable
    </div>
    <span v-else class="text-sm text-gray-400">—</span>
  </div>
</template>
