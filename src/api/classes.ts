import type { PimClass } from '@/types'
import client from './client'

export const classesApi = {
  list: (): Promise<PimClass[]> =>
    client.get<PimClass[]>('/classes').then((r) => r.data),

  get: (id: number): Promise<PimClass> =>
    client.get<PimClass>(`/classes/${id}`).then((r) => r.data),
}
