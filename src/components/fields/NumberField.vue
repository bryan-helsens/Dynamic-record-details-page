<script setup lang="ts">
defineProps<{ value: unknown }>()
</script>

<template>
  <p class="text-gray-900 dark:text-gray-100 font-mono text-lg font-semibold">
    {{ value !== null && value !== undefined ? Number(value).toLocaleString() : '—' }}
  </p>
</template>
