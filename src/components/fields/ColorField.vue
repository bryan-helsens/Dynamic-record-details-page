<script setup lang="ts">
defineProps<{ value: unknown }>()
</script>

<template>
  <div v-if="value" class="flex items-center gap-2">
    <span
      class="inline-block w-6 h-6 rounded border border-gray-200 shadow-sm flex-shrink-0"
      :style="{ backgroundColor: String(value) }"
    />
    <span class="font-mono text-sm text-gray-700">{{ value }}</span>
  </div>
  <span v-else class="text-gray-400 text-sm">—</span>
</template>
