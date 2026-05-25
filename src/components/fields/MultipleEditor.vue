<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClassStore } from '@/stores/classStore'
import type { Field } from '@/types'

const props = defineProps<{ field: Field; value: unknown }>()
const emit = defineEmits<{ (e: 'update:value', v: unknown): void }>()

const classStore = useClassStore()

onMounted(() => {
  if (props.field.referencedClassId) classStore.fetchOne(props.field.referencedClassId)
})

const refClass = computed(() =>
  props.field.referencedClassId ? classStore.getById(props.field.referencedClassId) : undefined,
)

const blocks = computed<Record<string, unknown>[]>(() =>
  Array.isArray(props.value) ? [...(props.value as Record<string, unknown>[])] : [],
)

function updateCell(blockIdx: number, fieldId: string, val: string) {
  const next = blocks.value.map((b, i) =>
    i === blockIdx ? { ...b, [fieldId]: val } : b,
  )
  emit('update:value', next)
}

function addBlock() {
  const empty: Record<string, unknown> = {}
  if (refClass.value) {
    refClass.value.fields.forEach((f) => { empty[String(f.id)] = '' })
  }
  emit('update:value', [...blocks.value, empty])
}

function removeBlock(idx: number) {
  emit('update:value', blocks.value.filter((_, i) => i !== idx))
}
</script>

<template>
  <div class="flex flex-col gap-2 h-full">
    <div v-if="!refClass" class="text-xs text-ink-subtle">Loading…</div>
    <template v-else>
      <div class="overflow-x-auto overflow-y-auto flex-1">
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
            <tr
              v-for="(block, idx) in blocks"
              :key="idx"
              class="border-b border-blue-50"
            >
              <td v-for="f in refClass.fields" :key="f.id" class="py-1 pr-2 align-top">
                <input
                  type="text"
                  :value="String(block[String(f.id)] ?? '')"
                  class="w-full px-2 py-1 text-xs rounded border border-blue-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white outline-none"
                  @input="updateCell(idx, String(f.id), ($event.target as HTMLInputElement).value)"
                />
              </td>
              <td class="py-1 align-top">
                <button
                  class="p-0.5 hover:text-red-500 text-ink-subtle transition-colors"
                  title="Remove row"
                  @click="removeBlock(idx)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button
        class="self-start flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
        @click="addBlock"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add row
      </button>
    </template>
  </div>
</template>
