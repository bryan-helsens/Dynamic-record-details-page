<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: unknown; type?: 'date' | 'datetime' }>()

const formatted = computed(() => {
  if (!props.value) return '—'
  const d = new Date(props.value as string)
  if (isNaN(d.getTime())) return String(props.value)
  return props.type === 'datetime'
    ? d.toLocaleString()
    : d.toLocaleDateString()
})
</script>

<template>
  <p class="text-gray-900 dark:text-gray-100">{{ formatted }}</p>
</template>
