import type { PimRecord } from '@/types'
import client from './client'

export const recordsApi = {
  get: (id: number): Promise<PimRecord> =>
    client.get<PimRecord>(`/records/${id}`).then((r) => r.data),

  listByClass: (classId: number): Promise<PimRecord[]> =>
    client.get<PimRecord[]>(`/classes/${classId}/records`).then((r) => r.data),

  update: (id: number, values: Record<string, unknown>): Promise<PimRecord> =>
    client.patch<PimRecord>(`/records/${id}`, { values }).then((r) => r.data),
}
