<script setup lang="ts">
defineProps<{ value: unknown }>()
</script>

<template>
  <div v-if="Array.isArray(value)" class="flex flex-wrap gap-1.5">
    <span
      v-for="(item, i) in value"
      :key="i"
      class="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-sm"
    >
      {{ item }}
    </span>
    <span v-if="(value as unknown[]).length === 0" class="text-gray-400 text-sm">—</span>
  </div>
  <span v-else-if="value" class="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-sm">
    {{ value }}
  </span>
  <span v-else class="text-gray-400 text-sm">—</span>
</template>
