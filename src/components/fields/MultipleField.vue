<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useClassStore } from '@/stores/classStore'

// Lazy self-import for recursive rendering — Vite resolves the circular ref at runtime
const MultipleFieldNested = defineAsyncComponent(() => import('./MultipleField.vue'))

const props = defineProps<{
  value: unknown
  referencedClassId?: number
  depth?: number
}>()

const classStore = useClassStore()
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

function toggleExpand(key: string) {
  expanded.value[key] = !expanded.value[key]
}

function nestedCount(val: unknown): number {
  return Array.isArray(val) ? val.length : 0
}

// Depth-based left-border accent colour
const depthBorder = computed(() => {
  const colors = ['border-blue-300', 'border-blue-400', 'border-blue-500', 'border-blue-600']
  return colors[Math.min((props.depth ?? 1) - 1, colors.length - 1)]
})
const depthBg = computed(() => {
  const bgs = ['bg-blue-50/70', 'bg-blue-100/50', 'bg-blue-100/70', 'bg-blue-200/40']
  return bgs[Math.min((props.depth ?? 1) - 1, bgs.length - 1)]
})
</script>

<template>
  <div v-if="!blocks.length" class="text-ink-subtle text-sm">—</div>

  <div v-else-if="refClass" class="overflow-x-auto">
    <table class="w-full text-sm border-collapse">
      <thead>
        <tr>
          <th
            v-for="f in refClass.fields"
            :key="f.id"
            class="text-left text-[11px] font-semibold uppercase tracking-widest text-ink-subtle pb-2 pr-4 whitespace-nowrap border-b border-blue-100"
          >
            {{ f.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(block, rowIdx) in blocks" :key="rowIdx">

          <!-- Data row -->
          <tr class="border-b border-blue-50 hover:bg-blue-50/30 transition-colors">
            <td
              v-for="f in refClass.fields"
              :key="f.id"
              class="py-1.5 pr-4 align-top"
            >
              <!-- Nested multiple field: show expand toggle -->
              <template v-if="f.type === 'multiple'">
                <button
                  v-if="nestedCount(block[String(f.id)]) > 0"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
                  :class="expanded[`${rowIdx}-${f.id}`]
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'"
                  @click="toggleExpand(`${rowIdx}-${f.id}`)"
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

              <!-- Normal text value -->
              <span v-else class="text-ink">{{ block[String(f.id)] ?? '—' }}</span>
            </td>
          </tr>

          <!-- Expanded sub-panels: one per expanded multiple field in this row -->
          <template
            v-for="f in refClass.fields.filter(ff => ff.type === 'multiple')"
            :key="`panel-${rowIdx}-${f.id}`"
          >
            <tr v-if="expanded[`${rowIdx}-${f.id}`]">
              <td :colspan="refClass.fields.length" class="pb-2 pt-0">
                <div
                  class="ml-2 mt-1 rounded-r-lg border-l-2 px-3 py-2"
                  :class="[depthBorder, depthBg]"
                >
                  <div class="text-[10px] font-semibold uppercase tracking-widest mb-2"
                    :class="[`text-blue-${400 + Math.min((depth ?? 0), 2) * 100}`]"
                  >
                    {{ f.name }}
                  </div>
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

  <div v-else class="text-ink-subtle text-sm">Loading…</div>
</template>
