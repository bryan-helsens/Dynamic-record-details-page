import type { View, CreateViewPayload, UpdateViewPayload } from '@/types'
import client from './client'

export const viewsApi = {
  listByClass: (classId: number): Promise<View[]> =>
    client.get<View[]>(`/classes/${classId}/views`).then((r) => r.data),

  get: (id: number): Promise<View> =>
    client.get<View>(`/views/${id}`).then((r) => r.data),

  create: (payload: CreateViewPayload): Promise<View> =>
    client.post<View>('/views', payload).then((r) => r.data),

  update: ({ id, ...payload }: UpdateViewPayload): Promise<View> =>
    client.put<View>(`/views/${id}`, payload).then((r) => r.data),

  delete: (id: number): Promise<void> =>
    client.delete(`/views/${id}`).then(() => undefined),

  duplicate: (id: number, name: string): Promise<View> =>
    client.post<View>(`/views/${id}/duplicate`, { name }).then((r) => r.data),

  setDefault: (classId: number, viewId: number): Promise<void> =>
    client.post(`/classes/${classId}/views/${viewId}/default`).then(() => undefined),
}
