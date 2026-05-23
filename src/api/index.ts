import { mockClassesApi, mockRecordsApi, mockViewsApi } from './mock'
import { classesApi as realClassesApi } from './classes'
import { recordsApi as realRecordsApi } from './records'
import { viewsApi as realViewsApi } from './views'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export const classesApi = useMock ? mockClassesApi : realClassesApi
export const recordsApi = useMock ? mockRecordsApi : realRecordsApi
export const viewsApi = useMock ? mockViewsApi : realViewsApi

export { default as apiClient } from './client'
