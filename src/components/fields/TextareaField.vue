<script setup lang="ts">
defineProps<{ value: unknown }>()
</script>

<template>
  <p class="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words leading-relaxed text-sm">
    {{ value ?? '—' }}
  </p>
</template>
