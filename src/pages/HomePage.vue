<script setup lang="ts">
import { onMounted } from 'vue'
import { useClassStore } from '@/stores/classStore'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const classStore = useClassStore()
onMounted(() => classStore.fetchAll())
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
        <h1 class="text-lg font-bold text-gray-900">PIM — Dynamic Record Views</h1>
      </div>
    </header>

    <main class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="classStore.loading" class="flex items-center justify-center h-48">
        <LoadingSpinner label="Loading classes…" />
      </div>

      <div v-else-if="classStore.error" class="text-red-600 text-sm">{{ classStore.error }}</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="cls in classStore.classes"
          :key="cls.id"
          :to="{ name: 'class-records', params: { classId: cls.id } }"
          class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-300 transition-all group"
        >
          <div class="flex items-start justify-between mb-3">
            <h2 class="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">{{ cls.name }}</h2>
            <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {{ cls.fields.length }} field{{ cls.fields.length !== 1 ? 's' : '' }}
            </span>
          </div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="field in cls.fields.slice(0, 5)"
              :key="field.id"
              class="text-xs px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-gray-600"
            >
              {{ field.name }}
            </span>
            <span v-if="cls.fields.length > 5" class="text-xs text-gray-400">
              +{{ cls.fields.length - 5 }} more
            </span>
          </div>
        </router-link>
      </div>
    </main>
  </div>
</template>
