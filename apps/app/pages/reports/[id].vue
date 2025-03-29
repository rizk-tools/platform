<script setup lang="ts">
import { VuePDF, usePDF } from '@tato30/vue-pdf'
import '@tato30/vue-pdf/style.css'
import 'v-calendar/style.css'

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
  },
  'risk-assessment': {
    title: 'Risk Assessment Report',
    description: 'Comprehensive risk assessment analysis'
  }
} as const

type ReportId = keyof typeof reports

const currentReport = computed(() => reports[route.params.id as ReportId] || reports['eu-ai-act'])

// Separate date values
const startDate = ref(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) // Default to last 90 days
const endDate = ref(new Date())

// Format dates for the query
const formattedDateRange = computed(() => {
  const start = startDate.value instanceof Date ?
    new Intl.DateTimeFormat('en-US').format(startDate.value) : '';
  const end = endDate.value instanceof Date ?
    new Intl.DateTimeFormat('en-US').format(endDate.value) : '';
  return `${start} to ${end}`;
})

// Loading state
const isLoading = ref(false)
const error = ref<string | null>(null)

// Construct the URL with parameters
const reportUrl = ref('')

// Create a function to update the report URL
const updateReportUrl = () => {
  const baseUrl = 'http://localhost:3001/reports'
  const params = new URLSearchParams({
    orgId: 'demo',
    orgName: 'Acme Corp',
    timeRange: formattedDateRange.value
  })

  // Map our page ID to the API's expected type parameter
  const reportType = route.params.id === 'hipaa' ? 'risk-assessment' : route.params.id

  reportUrl.value = `${baseUrl}/${reportType}?${params.toString()}`
}

// Initialize the report URL
updateReportUrl()

// Initialize PDF viewer with the report URL
const pdfRef = ref()
const { pdf } = usePDF(reportUrl)

// Function to reload the PDF with new URL
const reloadPDF = async () => {
  try {
    isLoading.value = true
    error.value = null

    if (!(startDate.value instanceof Date) || !(endDate.value instanceof Date)) {
      throw new Error('Invalid date range')
    }

    updateReportUrl()
    await pdfRef.value?.loadPDF(reportUrl.value)
  } catch (err) {
    error.value = 'Failed to load the report. Please try again.'
    console.error('Error loading PDF:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="col-span-3 space-y-6">
    <div class="mb-8">
      <div class="flex items-center gap-4">
        <NuxtLink to="/reports" class="text-primary-600 hover:text-primary-700 flex items-center gap-2">
          <div class="i-heroicons-arrow-left text-xl" />
          <span>Back to Reports</span>
        </NuxtLink>
      </div>

      <h1 class="text-2xl font-bold text-gray-900 mt-4">{{ currentReport?.title }}</h1>
      <p class="mt-2 text-gray-600">{{ currentReport?.description }}</p>
    </div>

    <!-- Date range filter -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      <h2 class="text-lg font-medium mb-4">Report Filters</h2>
      <div class="flex flex-col space-y-4">
        <div class="flex items-center gap-4">
          <span class="text-gray-700 w-24">Start Date:</span>
          <UiDatepicker v-model="startDate" color="blue" is24hr>
            <template #default="{ togglePopover }">
              <UiButton variant="outline" class="w-[200px] justify-start text-left" @click="togglePopover">
                <div class="i-heroicons-calendar h-4 w-4 mr-2" />
                <span>{{ startDate }}</span>
              </UiButton>
            </template>
          </UiDatepicker>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-gray-700 w-24">End Date:</span>
          <UiDatepicker v-model="endDate" color="blue" is24hr>
            <template #default="{ togglePopover }">
              <UiButton variant="outline" class="w-[200px] justify-start text-left" @click="togglePopover">
                <div class="i-heroicons-calendar h-4 w-4 mr-2" />
                <span>{{ endDate }}</span>
              </UiButton>
            </template>
          </UiDatepicker>
        </div>

        <div class="pt-2">
          <UiButton :disabled="isLoading" @click="reloadPDF">
            <div v-if="isLoading" class="i-heroicons-arrow-path animate-spin mr-2" />
            {{ isLoading ? 'Loading...' : 'Apply Filters' }}
          </UiButton>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div v-if="error" class="p-4 bg-red-50 text-red-600 rounded-md mb-4">
        {{ error }}
      </div>

      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <div class="i-heroicons-arrow-path animate-spin text-3xl text-gray-400" />
      </div>

      <div v-else class="pdf-container">
        <VuePDF ref="pdfRef" :pdf="pdf" class="w-full" />
      </div>
    </div>
  </div>
</template>
