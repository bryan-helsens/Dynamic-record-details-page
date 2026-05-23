<script setup lang="ts">
defineProps<{ value: unknown }>()
</script>

<template>
  <a
    v-if="value"
    :href="String(value)"
    target="_blank"
    rel="noopener noreferrer"
    class="text-blue-600 hover:text-blue-800 underline break-all text-sm"
  >
    {{ value }}
  </a>
  <span v-else class="text-gray-400 text-sm">—</span>
</template>
