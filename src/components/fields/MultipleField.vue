<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useClassStore } from '@/stores/classStore'

const props = defineProps<{
  value: unknown
  referencedClassId?: number
}>()

const classStore = useClassStore()

onMounted(() => {
  if (props.referencedClassId) classStore.fetchOne(props.referencedClassId)
})

const refClass = computed(() =>
  props.referencedClassId ? classStore.getById(props.referencedClassId) : undefined,
)

const blocks = computed<Record<string, unknown>[]>(() =>
  Array.isArray(props.value) ? (props.value as Record<string, unknown>[]) : [],
)
</script>

<template>
  <div v-if="!blocks.length" class="text-ink-subtle text-sm">—</div>

  <div v-else-if="refClass" class="overflow-x-auto h-full">
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
        <tr
          v-for="(block, idx) in blocks"
          :key="idx"
          class="border-b border-blue-50 hover:bg-blue-50/40 transition-colors"
        >
          <td
            v-for="f in refClass.fields"
            :key="f.id"
            class="py-1.5 pr-4 text-ink align-top"
          >
            {{ block[String(f.id)] ?? '—' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-else class="text-ink-subtle text-sm">Loading…</div>
</template>
