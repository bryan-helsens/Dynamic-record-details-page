<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{ value: unknown; type?: string }>()

const isEmail = computed(() => props.type === 'email')

const domain = computed(() => {
  if (!props.value) return null
  if (isEmail.value) {
    const parts = String(props.value).split('@')
    return parts.length > 1 ? parts[1] : null
  }
  try {
    return new URL(String(props.value)).hostname
  } catch {
    return null
  }
})

const href = computed(() => {
  if (!props.value) return null
  return isEmail.value ? `mailto:${props.value}` : String(props.value)
})

const faviconLoaded = ref(false)
const faviconSrc = computed(() => {
  if (!domain.value || isEmail.value) return null
  return `https://www.google.com/s2/favicons?domain=${domain.value}&sz=32`
})

watch(() => props.value, () => { faviconLoaded.value = false })
</script>

<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors group max-w-full min-w-0"
  >
    <!-- Favicon or icon -->
    <span class="w-4 h-4 flex-shrink-0 relative">
      <img
        v-if="faviconSrc"
        :src="faviconSrc"
        class="w-4 h-4 rounded-sm absolute inset-0 transition-opacity"
        :class="faviconLoaded ? 'opacity-100' : 'opacity-0'"
        alt=""
        @load="faviconLoaded = true"
        @error="faviconLoaded = false"
      />
      <svg
        class="w-4 h-4 text-blue-400 absolute inset-0 transition-opacity"
        :class="faviconLoaded ? 'opacity-0' : 'opacity-100'"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path v-if="isEmail" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    </span>

    <span class="text-sm text-blue-700 font-medium truncate flex-1 min-w-0">
      {{ domain ?? value }}
    </span>

    <svg
      class="w-3 h-3 text-blue-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  </a>

  <span v-else class="text-ink-subtle text-sm">—</span>
</template>
