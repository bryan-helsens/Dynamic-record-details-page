import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { View, CreateViewPayload, UpdateViewPayload, LayoutItem } from '@/types'
import { viewsApi } from '@/api'

const ACTIVE_VIEW_KEY = 'pim:activeViewId'

export const useViewStore = defineStore('view', () => {
  const views = ref<View[]>([])
  const activeViewId = ref<number | null>(
    Number(localStorage.getItem(ACTIVE_VIEW_KEY)) || null,
  )
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const activeView = computed(() => views.value.find((v) => v.id === activeViewId.value) ?? null)

  const byClass = computed(() => (classId: number) => views.value.filter((v) => v.classId === classId))

  function setActiveView(id: number | null) {
    activeViewId.value = id
    if (id !== null) localStorage.setItem(ACTIVE_VIEW_KEY, String(id))
    else localStorage.removeItem(ACTIVE_VIEW_KEY)
  }

  async function fetchViewsForClass(classId: number) {
    loading.value = true
    error.value = null
    try {
      const fetched = await viewsApi.listByClass(classId)
      // merge without duplicates
      const ids = new Set(fetched.map((v) => v.id))
      views.value = [...views.value.filter((v) => !ids.has(v.id)), ...fetched]
      // Prefer the stored active view, then the default view, then the first
      if (activeViewId.value === null || !fetched.find((v) => v.id === activeViewId.value)) {
        const defaultView = fetched.find((v) => v.isDefault) ?? fetched[0]
        setActiveView(defaultView?.id ?? null)
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function createView(payload: CreateViewPayload): Promise<View | null> {
    saving.value = true
    error.value = null
    try {
      const created = await viewsApi.create(payload)
      views.value.push(created)
      setActiveView(created.id)
      return created
    } catch (e) {
      error.value = (e as Error).message
      return null
    } finally {
      saving.value = false
    }
  }

  async function saveView(payload: UpdateViewPayload): Promise<View | null> {
    saving.value = true
    error.value = null
    try {
      const updated = await viewsApi.update(payload)
      const idx = views.value.findIndex((v) => v.id === updated.id)
      if (idx >= 0) views.value[idx] = updated
      return updated
    } catch (e) {
      error.value = (e as Error).message
      return null
    } finally {
      saving.value = false
    }
  }

  async function deleteView(id: number) {
    error.value = null
    try {
      await viewsApi.delete(id)
      views.value = views.value.filter((v) => v.id !== id)
      if (activeViewId.value === id) {
        setActiveView(views.value[0]?.id ?? null)
      }
    } catch (e) {
      error.value = (e as Error).message
    }
  }

  async function duplicateView(id: number, name: string): Promise<View | null> {
    saving.value = true
    error.value = null
    try {
      const duped = await viewsApi.duplicate(id, name)
      views.value.push(duped)
      setActiveView(duped.id)
      return duped
    } catch (e) {
      error.value = (e as Error).message
      return null
    } finally {
      saving.value = false
    }
  }

  async function setDefaultView(classId: number, viewId: number) {
    error.value = null
    try {
      await viewsApi.setDefault(classId, viewId)
      views.value = views.value.map((v) =>
        v.classId === classId ? { ...v, isDefault: v.id === viewId } : v,
      )
    } catch (e) {
      error.value = (e as Error).message
    }
  }

  function updateLayoutInMemory(viewId: number, layout: LayoutItem[]) {
    const view = views.value.find((v) => v.id === viewId)
    if (view) view.layout = layout
  }

  return {
    views,
    activeViewId,
    activeView,
    loading,
    saving,
    error,
    byClass,
    setActiveView,
    fetchViewsForClass,
    createView,
    saveView,
    deleteView,
    duplicateView,
    setDefaultView,
    updateLayoutInMemory,
  }
})
