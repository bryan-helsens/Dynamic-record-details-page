<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ value: unknown }>()
const isTrue = computed(() => Boolean(props.value))
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
    :class="isTrue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="isTrue ? 'bg-green-500' : 'bg-red-500'" />
    {{ isTrue ? 'Yes' : 'No' }}
  </span>
</template>
