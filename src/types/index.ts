// ─── Field Types ────────────────────────────────────────────────────────────

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'image'
  | 'relation'
  | 'select'
  | 'multiselect'
  | 'url'
  | 'email'
  | 'color'

export interface Field {
  id: number
  name: string
  type: FieldType
  required?: boolean
  options?: string[]          // for select / multiselect
  relationClassId?: number    // for relation type
  meta?: Record<string, unknown>
}

// ─── Class ──────────────────────────────────────────────────────────────────

export interface PimClass {
  id: number
  name: string
  fields: Field[]
}

// ─── Record ─────────────────────────────────────────────────────────────────

export type RecordValues = Record<string, unknown>

export interface PimRecord {
  id: number
  classId: number
  values: RecordValues
}

// ─── View Layout ────────────────────────────────────────────────────────────

export interface LayoutItem {
  fieldId: number
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  /** Optional per-widget display settings */
  displayOptions?: WidgetDisplayOptions
}

export interface WidgetDisplayOptions {
  showLabel?: boolean
  labelPosition?: 'top' | 'left' | 'hidden'
  fontSize?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'card' | 'highlight' | 'minimal'
}

export interface View {
  id: number
  name: string
  classId: number
  description?: string
  isDefault?: boolean
  layout: LayoutItem[]
  columns?: number    // grid columns, default 12
  rowHeight?: number  // px per row unit, default 60
  createdAt?: string
  updatedAt?: string
}

// ─── API Payloads ────────────────────────────────────────────────────────────

export interface CreateViewPayload {
  name: string
  classId: number
  description?: string
  layout: LayoutItem[]
  columns?: number
  rowHeight?: number
}

export interface UpdateViewPayload extends Partial<CreateViewPayload> {
  id: number
}

// ─── UI State ────────────────────────────────────────────────────────────────

export type PageMode = 'view' | 'edit'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timeout?: number
}
