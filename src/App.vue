<script setup lang="ts">
import { ref, provide } from 'vue'
import { RouterView } from 'vue-router'
import AppToast from '@/components/common/AppToast.vue'

const toastRef = ref<InstanceType<typeof AppToast> | null>(null)
provide('toast', toastRef)
</script>

<template>
  <RouterView />
  <AppToast ref="toastRef" />
</template>
