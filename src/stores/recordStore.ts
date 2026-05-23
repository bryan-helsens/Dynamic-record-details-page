import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PimRecord } from '@/types'
import { recordsApi } from '@/api'

export const useRecordStore = defineStore('record', () => {
  const records = ref<Map<number, PimRecord>>(new Map())
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const getById = computed(() => (id: number) => records.value.get(id))

  async function fetchRecord(id: number) {
    loading.value = true
    error.value = null
    try {
      const record = await recordsApi.get(id)
      records.value.set(record.id, record)
      return record
    } catch (e) {
      error.value = (e as Error).message
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateRecord(id: number, values: Record<string, unknown>) {
    saving.value = true
    error.value = null
    try {
      const updated = await recordsApi.update(id, values)
      records.value.set(updated.id, updated)
      return updated
    } catch (e) {
      error.value = (e as Error).message
      return null
    } finally {
      saving.value = false
    }
  }

  return { records, loading, saving, error, getById, fetchRecord, updateRecord }
})
