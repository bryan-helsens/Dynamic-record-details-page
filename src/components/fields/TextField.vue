<script setup lang="ts">
defineProps<{ value: unknown }>()
</script>

<template>
  <p class="text-gray-900 dark:text-gray-100 break-words leading-relaxed">
    {{ value ?? '—' }}
  </p>
</template>
