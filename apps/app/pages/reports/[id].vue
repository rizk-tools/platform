<script setup lang="ts">
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'

definePageMeta({
  layout: "app",
})

const route = useRoute()
const reports = {
  'eu-ai-act': {
    title: 'EU AI Act Compliance Report',
    description: 'Detailed compliance analysis for EU AI Act requirements'
  },
  'hipaa': {
    title: 'HIPAA Compliance Report',
    description: 'Health Insurance Portability and Accountability Act compliance analysis'
  }
} as const

type ReportId = keyof typeof reports

const currentReport = computed(() => reports[route.params.id as ReportId])

// Initialize PDF viewer with the report URL
const { pdf } = usePDF(`http://localhost:3001/reports`)
</script>

<template>
<div class="col-span-3 space-y-6">
    <div class="mb-8">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/reports"
          class="text-primary-600 hover:text-primary-700 flex items-center gap-2"
        >
          <div class="i-heroicons-arrow-left text-xl" />
          <span>Back to Reports</span>
        </NuxtLink>
      </div>
      
      <h1 class="text-2xl font-bold text-gray-900 mt-4">{{ currentReport?.title }}</h1>
      <p class="mt-2 text-gray-600">{{ currentReport?.description }}</p>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="pdf-container">
        <VuePDF
          :pdf="pdf"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>
