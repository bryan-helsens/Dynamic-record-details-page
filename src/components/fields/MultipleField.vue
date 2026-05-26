<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useClassStore } from '@/stores/classStore'
import type { Field } from '@/types'

// Lazy self-import for recursive nested rendering
const MultipleFieldNested = defineAsyncComponent(() => import('./MultipleField.vue'))

const props = defineProps<{
  value: unknown
  referencedClassId?: number
  depth?: number
}>()

const classStore = useClassStore()

// expanded keys: `${blockOriginalIdx}-${fieldId}`
const expanded = ref<Record<string, boolean>>({})

onMounted(() => {
  if (props.referencedClassId) classStore.fetchOne(props.referencedClassId)
})

const refClass = computed(() =>
  props.referencedClassId ? classStore.getById(props.referencedClassId) : undefined,
)
const blocks = computed<Record<string, unknown>[]>(() =>
  Array.isArray(props.value) ? (props.value as Record<string, unknown>[]) : [],
)

// ── Grouping ────────────────────────────────────────────────────────────────
// If the first field has repeated values, group rows by it and show the
// remaining fields as columns. Otherwise fall back to a flat table.

const groupField = computed((): Field | undefined => refClass.value?.fields[0])
const dataFields = computed((): Field[] => {
  if (!refClass.value) return []
  return shouldGroup.value ? refClass.value.fields.slice(1) : refClass.value.fields
})

const shouldGroup = computed((): boolean => {
  const gf = groupField.value
  if (!gf || blocks.value.length < 2) return false
  const vals = blocks.value.map(b => String(b[String(gf.id)] ?? ''))
  return new Set(vals).size < vals.length
})

type Entry = { block: Record<string, unknown>; idx: number }

// Ordered list of [groupName, entries[]] preserving insertion order
const groups = computed((): [string, Entry[]][] => {
  const gf = groupField.value
  if (!gf) return []
  const map = new Map<string, Entry[]>()
  blocks.value.forEach((block, idx) => {
    const key = String(block[String(gf.id)] ?? '—')
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push({ block, idx })
  })
  return [...map.entries()]
})

// ── Expand/collapse ─────────────────────────────────────────────────────────
function toggleExpand(key: string) {
  // Spread into a new object so Vue tracks the change reliably
  expanded.value = { ...expanded.value, [key]: !expanded.value[key] }
}

function nestedCount(val: unknown): number {
  return Array.isArray(val) ? val.length : 0
}

// Depth-based accent colours for nested panels
const depthBorder = computed(() =>
  ['border-blue-300', 'border-blue-400', 'border-blue-500', 'border-blue-600']
    [Math.min((props.depth ?? 1) - 1, 3)],
)
const depthBg = computed(() =>
  ['bg-blue-50/60', 'bg-blue-100/50', 'bg-blue-100/70', 'bg-blue-200/40']
    [Math.min((props.depth ?? 1) - 1, 3)],
)
</script>

<template>
  <div v-if="!blocks.length" class="text-ink-subtle text-sm py-1">—</div>
  <div v-else-if="!refClass" class="text-ink-subtle text-sm py-1">Loading…</div>

  <div v-else class="overflow-x-auto">
    <table class="w-full text-sm border-collapse">

      <!-- Header: remaining (or all) field names -->
      <thead>
        <tr>
          <th
            v-for="f in dataFields"
            :key="f.id"
            class="text-left text-[11px] font-semibold uppercase tracking-widest text-ink-subtle pb-2 pr-4 whitespace-nowrap border-b border-blue-100"
          >
            {{ f.name }}
          </th>
        </tr>
      </thead>

      <!-- ── Grouped tbody ── -->
      <tbody v-if="shouldGroup">
        <template v-for="[groupName, entries] in groups" :key="groupName">

          <!-- Group label row -->
          <tr>
            <td :colspan="dataFields.length" class="pt-3 pb-1 pr-4">
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  {{ groupName }}
                </span>
                <span class="text-[10px] text-ink-subtle bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full leading-none">
                  {{ entries.length }}
                </span>
              </div>
            </td>
          </tr>

          <!-- Data rows within this group -->
          <template v-for="{ block, idx } in entries" :key="idx">
            <tr class="hover:bg-blue-50/30 transition-colors">
              <td
                v-for="f in dataFields"
                :key="f.id"
                class="py-1.5 pr-4 pl-3 align-top border-b border-blue-50/60"
              >
                <template v-if="f.type === 'multiple'">
                  <button
                    v-if="nestedCount(block[String(f.id)]) > 0"
                    type="button"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
                    :class="expanded[`${idx}-${f.id}`]
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'"
                    @click.stop="toggleExpand(`${idx}-${f.id}`)"
                  >
                    {{ nestedCount(block[String(f.id)]) }} row{{ nestedCount(block[String(f.id)]) !== 1 ? 's' : '' }}
                    <svg
                      class="w-3 h-3 transition-transform duration-150"
                      :class="expanded[`${idx}-${f.id}`] ? 'rotate-180' : ''"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <span v-else class="text-xs text-ink-subtle">—</span>
                </template>
                <span v-else class="text-ink">{{ block[String(f.id)] ?? '—' }}</span>
              </td>
            </tr>

            <!-- Expanded nested panels for this row -->
            <template
              v-for="f in dataFields.filter(ff => ff.type === 'multiple')"
              :key="`panel-${idx}-${f.id}`"
            >
              <tr v-if="expanded[`${idx}-${f.id}`]">
                <td :colspan="dataFields.length" class="pb-2 pt-0 pl-3">
                  <div class="mt-1 rounded-r-lg border-l-2 px-3 py-2" :class="[depthBorder, depthBg]">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-blue-500 mb-2">
                      {{ f.name }}
                    </p>
                    <MultipleFieldNested
                      :value="block[String(f.id)]"
                      :referenced-class-id="f.referencedClassId"
                      :depth="(depth ?? 0) + 1"
                    />
                  </div>
                </td>
              </tr>
            </template>
          </template>

        </template>
      </tbody>

      <!-- ── Flat tbody (no duplicate first-field values) ── -->
      <tbody v-else>
        <template v-for="(block, rowIdx) in blocks" :key="rowIdx">
          <tr class="border-b border-blue-50 hover:bg-blue-50/30 transition-colors">
            <td
              v-for="f in dataFields"
              :key="f.id"
              class="py-1.5 pr-4 align-top"
            >
              <template v-if="f.type === 'multiple'">
                <button
                  v-if="nestedCount(block[String(f.id)]) > 0"
                  type="button"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
                  :class="expanded[`${rowIdx}-${f.id}`]
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'"
                  @click.stop="toggleExpand(`${rowIdx}-${f.id}`)"
                >
                  {{ nestedCount(block[String(f.id)]) }} row{{ nestedCount(block[String(f.id)]) !== 1 ? 's' : '' }}
                  <svg
                    class="w-3 h-3 transition-transform duration-150"
                    :class="expanded[`${rowIdx}-${f.id}`] ? 'rotate-180' : ''"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <span v-else class="text-xs text-ink-subtle">—</span>
              </template>
              <span v-else class="text-ink">{{ block[String(f.id)] ?? '—' }}</span>
            </td>
          </tr>

          <!-- Expanded nested panels -->
          <template
            v-for="f in dataFields.filter(ff => ff.type === 'multiple')"
            :key="`panel-${rowIdx}-${f.id}`"
          >
            <tr v-if="expanded[`${rowIdx}-${f.id}`]">
              <td :colspan="dataFields.length" class="pb-2 pt-0">
                <div class="ml-2 mt-1 rounded-r-lg border-l-2 px-3 py-2" :class="[depthBorder, depthBg]">
                  <p class="text-[10px] font-semibold uppercase tracking-widest text-blue-500 mb-2">
                    {{ f.name }}
                  </p>
                  <MultipleFieldNested
                    :value="block[String(f.id)]"
                    :referenced-class-id="f.referencedClassId"
                    :depth="(depth ?? 0) + 1"
                  />
                </div>
              </td>
            </tr>
          </template>
        </template>
      </tbody>

    </table>
  </div>
</template>
