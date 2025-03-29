<script setup lang="ts">
definePageMeta({
  layout: "app",
})

interface Report {
  id: string
  title: string
  description: string
  icon: string
}

const reports = ref<Report[]>([
  {
    id: 'eu-ai-act',
    title: 'EU AI Act',
    description: 'Compliance report for the European Union Artificial Intelligence Act',
    icon: 'i-heroicons-document-text'
  },
  {
    id: 'hipaa',
    title: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act compliance report',
    icon: 'i-heroicons-shield-check'
  }
])
</script>

<template>
<div class="col-span-3 space-y-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Compliance Reports</h1>
      <p class="mt-2 text-gray-600">View and download compliance reports for your AI systems</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="report in reports"
        :key="report.id"
        :to="`/reports/${report.id}`"
        class="block p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-lg transition-all duration-200"
      >
        <div class="flex items-start space-x-4">
          <div :class="[report.icon, 'text-primary-600 text-2xl']" />
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ report.title }}</h3>
            <p class="mt-2 text-sm text-gray-600">{{ report.description }}</p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template> 