import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PimClass, Field } from '@/types'
import { classesApi } from '@/api'

export const useClassStore = defineStore('class', () => {
  const classes = ref<PimClass[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getById = computed(() => (id: number) => classes.value.find((c) => c.id === id))

  const getFieldById = computed(() => (classId: number, fieldId: number): Field | undefined => {
    return getById.value(classId)?.fields.find((f) => f.id === fieldId)
  })

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      classes.value = await classesApi.list()
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number) {
    if (getById.value(id)) return
    loading.value = true
    error.value = null
    try {
      const cls = await classesApi.get(id)
      const idx = classes.value.findIndex((c) => c.id === id)
      if (idx >= 0) classes.value[idx] = cls
      else classes.value.push(cls)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  return { classes, loading, error, getById, getFieldById, fetchAll, fetchOne }
})
