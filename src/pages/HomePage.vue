<script setup lang="ts">
import { onMounted } from 'vue'
import { useClassStore } from '@/stores/classStore'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const classStore = useClassStore()
onMounted(() => classStore.fetchAll())

const typeColors: Record<string, string> = {
  text: 'bg-sky-50 text-sky-700 border-sky-200',
  textarea: 'bg-sky-50 text-sky-700 border-sky-200',
  number: 'bg-violet-50 text-violet-700 border-violet-200',
  date: 'bg-orange-50 text-orange-700 border-orange-200',
  datetime: 'bg-orange-50 text-orange-700 border-orange-200',
  boolean: 'bg-green-50 text-green-700 border-green-200',
  image: 'bg-pink-50 text-pink-700 border-pink-200',
  relation: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  select: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  multiselect: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  url: 'bg-teal-50 text-teal-700 border-teal-200',
  email: 'bg-teal-50 text-teal-700 border-teal-200',
  color: 'bg-rose-50 text-rose-700 border-rose-200',
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-screen-xl mx-auto px-6 lg:px-8 py-6">
        <div class="flex items-center gap-3 mb-1">
          <div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 class="text-xl font-bold text-gray-900 tracking-tight">PIM</h1>
        </div>
        <p class="text-sm text-gray-500 ml-11">Product Information Management — Dynamic Record Views</p>
      </div>
    </header>

    <main class="max-w-screen-xl mx-auto px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div v-if="classStore.loading" class="flex items-center justify-center h-48">
        <LoadingSpinner label="Loading classes…" />
      </div>

      <div v-else-if="classStore.error" class="text-red-600 text-sm">{{ classStore.error }}</div>

      <template v-else>
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Classes</h2>
          <span class="text-xs text-gray-400">{{ classStore.classes.length }} class{{ classStore.classes.length !== 1 ? 'es' : '' }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <router-link
            v-for="cls in classStore.classes"
            :key="cls.id"
            :to="{ name: 'class-records', params: { classId: cls.id } }"
            class="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-brand-300 transition-all duration-200"
          >
            <!-- Class name + field count -->
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="font-semibold text-gray-900 text-base group-hover:text-brand-700 transition-colors">
                  {{ cls.name }}
                </h3>
                <p class="text-xs text-gray-400 mt-0.5">{{ cls.fields.length }} field{{ cls.fields.length !== 1 ? 's' : '' }}</p>
              </div>
              <span class="text-gray-300 group-hover:text-brand-400 transition-colors mt-0.5">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>

            <!-- Field type pills -->
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="field in cls.fields.slice(0, 6)"
                :key="field.id"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border"
                :class="typeColors[field.type] ?? 'bg-gray-50 text-gray-600 border-gray-200'"
              >
                {{ field.name }}
              </span>
              <span
                v-if="cls.fields.length > 6"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-400 border border-gray-200"
              >
                +{{ cls.fields.length - 6 }} more
              </span>
            </div>
          </router-link>
        </div>

        <!-- Quick jump to demo records -->
        <div class="mt-10">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Quick Access</h2>
          </div>
          <div class="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            <router-link
              :to="{ name: 'record-details', params: { recordId: 100 } }"
              class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
            >
              <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm">📱</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">iPhone 15 Pro</p>
                <p class="text-xs text-gray-400">Product · Record #100</p>
              </div>
              <svg class="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
            <router-link
              :to="{ name: 'record-details', params: { recordId: 101 } }"
              class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
            >
              <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm">💻</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">MacBook Air M3</p>
                <p class="text-xs text-gray-400">Product · Record #101</p>
              </div>
              <svg class="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
            <router-link
              :to="{ name: 'record-details', params: { recordId: 200 } }"
              class="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
            >
              <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm">👤</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">Jane Smith</p>
                <p class="text-xs text-gray-400">Customer · Record #200</p>
              </div>
              <svg class="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
