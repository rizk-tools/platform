<script setup lang="ts">
import { useNuxtApp } from '#app';

definePageMeta({
  layout: 'app'
});

// Define types
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  popularity: number;
}

// Dummy data for templates
const templates = ref<Template[]>([
  {
    id: '1',
    name: 'GDPR Compliance Template',
    description: 'Standard template for EU General Data Protection Regulation compliance',
    category: 'Data Privacy',
    popularity: 87
  },
  {
    id: '2',
    name: 'AI Ethics Framework',
    description: 'Comprehensive template for ethical AI development and deployment',
    category: 'AI Ethics',
    popularity: 92
  },
  {
    id: '3',
    name: 'HIPAA Compliance',
    description: 'Healthcare data protection policy template aligned with HIPAA regulations',
    category: 'Healthcare',
    popularity: 76
  },
  {
    id: '4',
    name: 'Financial Services AI Governance',
    description: 'Compliance template for AI systems in financial institutions',
    category: 'Finance',
    popularity: 81
  },
  {
    id: '5',
    name: 'SOC 2 AI Security Controls',
    description: 'Security controls for AI systems following SOC 2 principles',
    category: 'Security',
    popularity: 79
  },
  {
    id: '6',
    name: 'Responsible AI Deployment',
    description: 'Guidelines for responsible deployment of AI in production environments',
    category: 'AI Ethics',
    popularity: 85
  }
]);

// Setup breadcrumbs
const { $breadcrumbs } = useNuxtApp();
if ($breadcrumbs) {
  $breadcrumbs.value = [
    { label: 'Policies', link: '/policies' },
    { label: 'Templates', link: '/policies/templates' }
  ];
}

// Use template
function useTemplate(templateId: string) {
  navigateTo(`/policies/create?template=${templateId}`);
}

// Get category icon
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'Data Privacy': 'lucide:shield',
    'AI Ethics': 'lucide:cpu',
    'Healthcare': 'lucide:heart-pulse',
    'Finance': 'lucide:landmark',
    'Security': 'lucide:lock'
  };
  
  return iconMap[category] || 'lucide:check-circle';
}

useSeoMeta({ title: 'Policy Templates - Rizk AI Compliance Platform' });
</script>

<template>
  <div class="md:col-span-3 space-y-8">
    <CommonPageTitle title="Policy Templates" description="Ready-to-use compliance policy templates for different industries and regulations" />

    <!-- Templates Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="template in templates" :key="template.id" class="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div class="flex flex-col space-y-1.5 p-6 pb-3">
          <div class="flex items-center gap-2 mb-2">
            <Icon :name="getCategoryIcon(template.category)" class="h-4 w-4 text-primary" />
            <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              {{ template.category }}
            </span>
          </div>
          <h3 class="text-lg font-semibold leading-none tracking-tight">{{ template.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ template.description }}</p>
        </div>
        <div class="flex items-center justify-end p-6 pt-2 pb-4">
          <button @click="useTemplate(template.id)" class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3">
            Use Template
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 