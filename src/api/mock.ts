/**
 * In-memory mock API — drop-in replacement for real HTTP calls during development.
 * Import this module in main.ts instead of the real API, or toggle via VITE_USE_MOCK=true.
 *
 * Seeded with a "Product" class having realistic fields and two sample records.
 */
import type { PimClass, PimRecord, View } from '@/types'

// ─── Seed Data ───────────────────────────────────────────────────────────────

const CLASSES: PimClass[] = [
  {
    id: 1,
    name: 'Product',
    fields: [
      { id: 11, name: 'Name', type: 'text', required: true },
      { id: 12, name: 'Price', type: 'number' },
      { id: 13, name: 'Description', type: 'textarea' },
      { id: 14, name: 'Image', type: 'image' },
      { id: 15, name: 'In Stock', type: 'boolean' },
      { id: 16, name: 'Launch Date', type: 'date' },
      { id: 17, name: 'Category', type: 'select', options: ['Electronics', 'Apparel', 'Food', 'Tools'] },
      { id: 18, name: 'Tags', type: 'multiselect', options: ['New', 'Sale', 'Featured', 'Bestseller'] },
      { id: 19, name: 'Product Page', type: 'url' },
      { id: 20, name: 'Brand Color', type: 'color' },
      { id: 50, name: 'Specifications', type: 'multiple', referencedClassId: 3 },
    ],
  },
  {
    id: 2,
    name: 'Customer',
    fields: [
      { id: 21, name: 'Full Name', type: 'text', required: true },
      { id: 22, name: 'Email', type: 'email' },
      { id: 23, name: 'Phone', type: 'text' },
      { id: 24, name: 'Active', type: 'boolean' },
      { id: 25, name: 'Joined', type: 'date' },
      { id: 26, name: 'Notes', type: 'textarea' },
    ],
  },
  {
    id: 3,
    name: 'Spec',
    fields: [
      { id: 51, name: 'Category', type: 'text' },
      { id: 52, name: 'Property', type: 'text' },
      { id: 53, name: 'Value', type: 'text' },
    ],
  },
]

const RECORDS: PimRecord[] = [
  {
    id: 100,
    classId: 1,
    values: {
      '11': 'iPhone 15 Pro',
      '12': 1299,
      '13': 'The most powerful iPhone ever. Built with titanium, featuring the A17 Pro chip.',
      '14': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231d1d1f"/><text x="300" y="185" font-family="system-ui,sans-serif" font-size="28" font-weight="600" fill="%23f5f5f7" text-anchor="middle">iPhone 15 Pro</text><text x="300" y="225" font-family="system-ui,sans-serif" font-size="16" fill="%23888" text-anchor="middle">Titanium · A17 Pro</text></svg>',
      '15': true,
      '16': '2023-09-22',
      '17': 'Electronics',
      '18': ['New', 'Featured'],
      '19': 'https://apple.com/iphone-15-pro',
      '20': '#1d1d1f',
      '50': [
        { '51': 'Display',  '52': 'Screen Size',  '53': '6.1 inch' },
        { '51': 'Display',  '52': 'Resolution',   '53': '2556 × 1179' },
        { '51': 'Display',  '52': 'Technology',   '53': 'Super Retina XDR OLED' },
        { '51': 'Chip',     '52': 'Processor',    '53': 'A17 Pro' },
        { '51': 'Chip',     '52': 'GPU',          '53': '6-core GPU' },
        { '51': 'Battery',  '52': 'Capacity',     '53': '3274 mAh' },
        { '51': 'Battery',  '52': 'Video Playback','53': 'Up to 23 hours' },
        { '51': 'Camera',   '52': 'Main',         '53': '48 MP, ƒ/1.78' },
        { '51': 'Camera',   '52': 'Telephoto',    '53': '12 MP, 3× optical zoom' },
      ],
    },
  },
  {
    id: 101,
    classId: 1,
    values: {
      '11': 'MacBook Air M3',
      '12': 1099,
      '13': 'Incredibly thin, up to 18 hours of battery, M3 chip.',
      '14': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f5f5f7"/><text x="300" y="185" font-family="system-ui,sans-serif" font-size="28" font-weight="600" fill="%231d1d1f" text-anchor="middle">MacBook Air M3</text><text x="300" y="225" font-family="system-ui,sans-serif" font-size="16" fill="%23666" text-anchor="middle">13" · 18h battery</text></svg>',
      '15': true,
      '16': '2024-03-08',
      '17': 'Electronics',
      '18': ['New', 'Bestseller'],
      '19': 'https://apple.com/macbook-air',
      '20': '#f5f5f7',
    },
  },
  {
    id: 200,
    classId: 2,
    values: {
      '21': 'Jane Smith',
      '22': 'jane@example.com',
      '23': '+1 555-0101',
      '24': true,
      '25': '2023-01-15',
      '26': 'VIP customer. Prefers email contact.',
    },
  },
]

const VIEWS: View[] = [
  {
    id: 5,
    name: 'Marketing View',
    classId: 1,
    isDefault: true,
    description: 'For the marketing team',
    columns: 12,
    rowHeight: 70,
    layout: [
      { fieldId: 11, x: 0, y: 0, w: 6, h: 2, displayOptions: { fontSize: 'xl', showLabel: true, labelPosition: 'top' } },
      { fieldId: 14, x: 6, y: 0, w: 6, h: 5 },
      { fieldId: 13, x: 0, y: 2, w: 6, h: 3, displayOptions: { showLabel: true, labelPosition: 'top' } },
      { fieldId: 12, x: 0, y: 5, w: 3, h: 2, displayOptions: { fontSize: 'lg' } },
      { fieldId: 15, x: 3, y: 5, w: 3, h: 2 },
      { fieldId: 17, x: 6, y: 5, w: 3, h: 2 },
      { fieldId: 18, x: 9, y: 5, w: 3, h: 2 },
      { fieldId: 50, x: 0, y: 7, w: 12, h: 5, displayOptions: { showLabel: true, labelPosition: 'top' } },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Compact View',
    classId: 1,
    columns: 12,
    rowHeight: 50,
    layout: [
      { fieldId: 11, x: 0, y: 0, w: 8, h: 2 },
      { fieldId: 12, x: 8, y: 0, w: 4, h: 2 },
      { fieldId: 17, x: 0, y: 2, w: 4, h: 2 },
      { fieldId: 15, x: 4, y: 2, w: 4, h: 2 },
      { fieldId: 16, x: 8, y: 2, w: 4, h: 2 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

let nextId = 100

// ─── Mock API Implementation ─────────────────────────────────────────────────

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

export const mockClassesApi = {
  list: () => delay([...CLASSES]),
  get: (id: number) => {
    const cls = CLASSES.find((c) => c.id === id)
    if (!cls) return Promise.reject(new Error('Class not found'))
    return delay({ ...cls, fields: [...cls.fields] })
  },
}

export const mockRecordsApi = {
  get: (id: number) => {
    const record = RECORDS.find((r) => r.id === id)
    if (!record) return Promise.reject(new Error('Record not found'))
    return delay({ ...record, values: { ...record.values } })
  },
  listByClass: (classId: number) =>
    delay(RECORDS.filter((r) => r.classId === classId).map((r) => ({ ...r }))),
  update: (id: number, values: Record<string, unknown>) => {
    const record = RECORDS.find((r) => r.id === id)
    if (!record) return Promise.reject(new Error('Record not found'))
    record.values = { ...record.values, ...values }
    return delay({ ...record })
  },
}

export const mockViewsApi = {
  listByClass: (classId: number) =>
    delay(VIEWS.filter((v) => v.classId === classId).map((v) => ({ ...v }))),
  get: (id: number) => {
    const view = VIEWS.find((v) => v.id === id)
    if (!view) return Promise.reject(new Error('View not found'))
    return delay({ ...view })
  },
  create: (payload: Omit<View, 'id' | 'createdAt' | 'updatedAt'>) => {
    const view: View = {
      ...payload,
      id: ++nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    VIEWS.push(view)
    return delay({ ...view })
  },
  update: ({ id, ...payload }: Partial<View> & { id: number }) => {
    const idx = VIEWS.findIndex((v) => v.id === id)
    if (idx < 0) return Promise.reject(new Error('View not found'))
    VIEWS[idx] = { ...VIEWS[idx], ...payload, id, updatedAt: new Date().toISOString() }
    return delay({ ...VIEWS[idx] })
  },
  delete: (id: number) => {
    const idx = VIEWS.findIndex((v) => v.id === id)
    if (idx >= 0) VIEWS.splice(idx, 1)
    return delay(undefined)
  },
  setDefault: (classId: number, viewId: number) => {
    VIEWS.forEach((v) => {
      if (v.classId === classId) v.isDefault = v.id === viewId
    })
    return delay(undefined)
  },
  duplicate: (id: number, name: string) => {
    const original = VIEWS.find((v) => v.id === id)
    if (!original) return Promise.reject(new Error('View not found'))
    const duped: View = {
      ...original,
      id: ++nextId,
      name,
      layout: original.layout.map((l) => ({ ...l })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    VIEWS.push(duped)
    return delay({ ...duped })
  },
}
