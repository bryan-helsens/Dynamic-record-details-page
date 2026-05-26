<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useClassStore } from '@/stores/classStore'
import type { Field } from '@/types'

const MultipleEditorNested = defineAsyncComponent(() => import('./MultipleEditor.vue'))

const props = defineProps<{
  field: Field
  value: unknown
  depth?: number
}>()
const emit = defineEmits<{ (e: 'update:value', v: unknown): void }>()

const classStore = useClassStore()
const expanded = ref<Record<string, boolean>>({})

onMounted(() => {
  if (props.field.referencedClassId) classStore.fetchOne(props.field.referencedClassId)
})

const refClass = computed(() =>
  props.field.referencedClassId ? classStore.getById(props.field.referencedClassId) : undefined,
)
const blocks = computed<Record<string, unknown>[]>(() =>
  Array.isArray(props.value) ? [...(props.value as Record<string, unknown>[])] : [],
)

function updateCell(blockIdx: number, fieldId: string, val: unknown) {
  const next = blocks.value.map((b, i) =>
    i === blockIdx ? { ...b, [fieldId]: val } : b,
  )
  emit('update:value', next)
}

function addBlock() {
  const empty: Record<string, unknown> = {}
  if (refClass.value) {
    refClass.value.fields.forEach((f) => { empty[String(f.id)] = f.type === 'multiple' ? [] : '' })
  }
  emit('update:value', [...blocks.value, empty])
}

function removeBlock(idx: number) {
  const next: Record<string, boolean> = {}
  Object.entries(expanded.value).forEach(([k, v]) => {
    if (parseInt(k.split('-')[0]) !== idx) next[k] = v
  })
  expanded.value = next
  emit('update:value', blocks.value.filter((_, i) => i !== idx))
}

function toggleExpand(key: string) {
  expanded.value = { ...expanded.value, [key]: !expanded.value[key] }
}

function nestedCount(val: unknown): number {
  return Array.isArray(val) ? val.length : 0
}

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
  <div class="flex flex-col gap-2">
    <div v-if="!refClass" class="text-xs text-ink-subtle">Loading…</div>
    <template v-else>
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th
                v-for="f in refClass.fields"
                :key="f.id"
                class="text-left text-[11px] font-semibold uppercase tracking-widest text-ink-subtle pb-1.5 pr-2 whitespace-nowrap border-b border-blue-100"
              >
                {{ f.name }}
              </th>
              <th class="w-6 border-b border-blue-100" />
            </tr>
          </thead>
          <tbody>
            <template v-for="(block, rowIdx) in blocks" :key="rowIdx">
              <tr class="border-b border-blue-50">
                <td
                  v-for="f in refClass.fields"
                  :key="f.id"
                  class="py-1 pr-2 align-top"
                >
                  <!-- Nested multiple: expand toggle -->
                  <template v-if="f.type === 'multiple'">
                    <button
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
                  </template>

                  <!-- Text input -->
                  <input
                    v-else
                    type="text"
                    :value="String(block[String(f.id)] ?? '')"
                    class="w-full px-2 py-1 text-xs rounded border border-blue-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white outline-none"
                    @input="updateCell(rowIdx, String(f.id), ($event.target as HTMLInputElement).value)"
                  />
                </td>
                <td class="py-1 align-top">
                  <button
                    type="button"
                    class="p-0.5 hover:text-red-500 text-ink-subtle transition-colors"
                    title="Remove row"
                    @click.stop="removeBlock(rowIdx)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>

              <!-- Expanded nested editor panels -->
              <template
                v-for="f in refClass.fields.filter(ff => ff.type === 'multiple')"
                :key="`panel-${rowIdx}-${f.id}`"
              >
                <tr v-if="expanded[`${rowIdx}-${f.id}`]">
                  <td :colspan="refClass.fields.length + 1" class="pb-2 pt-0">
                    <div class="ml-2 mt-1 rounded-r-lg border-l-2 px-3 py-2" :class="[depthBorder, depthBg]">
                      <p class="text-[10px] font-semibold uppercase tracking-widest text-blue-500 mb-2">
                        {{ f.name }}
                      </p>
                      <MultipleEditorNested
                        :field="f"
                        :value="block[String(f.id)]"
                        :depth="(depth ?? 0) + 1"
                        @update:value="updateCell(rowIdx, String(f.id), $event)"
                      />
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>

      <button
        type="button"
        class="self-start flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
        @click.stop="addBlock"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add row
      </button>
    </template>
  </div>
</template>
