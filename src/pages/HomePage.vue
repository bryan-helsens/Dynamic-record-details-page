<script setup lang="ts">
import { onMounted } from 'vue'
import { useClassStore } from '@/stores/classStore'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const classStore = useClassStore()
onMounted(() => classStore.fetchAll())
</script>

<template>
  <div class="min-h-screen bg-surface-page">

    <!-- Header — black bar -->
    <header class="bg-ink text-white">
      <div class="max-w-screen-xl mx-auto px-6 lg:px-8 py-5 flex items-center gap-3">
        <div class="w-8 h-8 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h1 class="text-base font-semibold leading-tight tracking-tight">PIM</h1>
          <p class="text-xs text-blue-300 leading-tight">Product Information Management</p>
        </div>
      </div>
    </header>

    <!-- Blue accent bar -->
    <div class="h-1 bg-blue-600" />

    <main class="max-w-screen-xl mx-auto px-6 lg:px-8 py-8">

      <div v-if="classStore.loading" class="flex items-center justify-center h-48">
        <LoadingSpinner label="Loading…" />
      </div>
      <div v-else-if="classStore.error" class="text-red-600 text-sm">{{ classStore.error }}</div>

      <template v-else>
        <!-- Classes -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xs font-semibold uppercase tracking-widest text-ink-muted">Classes</h2>
            <span class="text-xs text-ink-subtle">{{ classStore.classes.length }} class{{ classStore.classes.length !== 1 ? 'es' : '' }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <router-link
              v-for="cls in classStore.classes"
              :key="cls.id"
              :to="{ name: 'class-records', params: { classId: cls.id } }"
              class="group bg-white rounded-xl border border-blue-100 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-150"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="font-semibold text-ink group-hover:text-blue-700 transition-colors">{{ cls.name }}</h3>
                  <p class="text-xs text-ink-subtle mt-0.5">{{ cls.fields.length }} field{{ cls.fields.length !== 1 ? 's' : '' }}</p>
                </div>
                <svg class="w-4 h-4 text-blue-200 group-hover:text-blue-500 transition-colors mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="field in cls.fields.slice(0, 6)"
                  :key="field.id"
                  class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {{ field.name }}
                </span>
                <span
                  v-if="cls.fields.length > 6"
                  class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-sunken text-ink-muted"
                >
                  +{{ cls.fields.length - 6 }} more
                </span>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Quick Access -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xs font-semibold uppercase tracking-widest text-ink-muted">Quick Access</h2>
          </div>

          <div class="bg-white rounded-xl border border-blue-100 overflow-hidden divide-y divide-blue-50">
            <router-link
              v-for="(item, i) in [
                { to: { name: 'record-details', params: { recordId: 100 } }, emoji: '📱', name: 'iPhone 15 Pro', sub: 'Product · Record #100' },
                { to: { name: 'record-details', params: { recordId: 101 } }, emoji: '💻', name: 'MacBook Air M3', sub: 'Product · Record #101' },
                { to: { name: 'record-details', params: { recordId: 200 } }, emoji: '👤', name: 'Jane Smith', sub: 'Customer · Record #200' },
              ]"
              :key="i"
              :to="item.to"
              class="flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50 transition-colors group"
            >
              <div class="w-8 h-8 rounded-lg bg-surface-sunken flex items-center justify-center flex-shrink-0 text-sm">{{ item.emoji }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-ink">{{ item.name }}</p>
                <p class="text-xs text-ink-subtle">{{ item.sub }}</p>
              </div>
              <svg class="w-4 h-4 text-blue-200 group-hover:text-blue-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
