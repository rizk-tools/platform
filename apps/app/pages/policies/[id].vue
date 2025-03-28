<script setup lang="ts">
import { useNuxtApp } from '#app';
import MarkdownIt from 'markdown-it';

definePageMeta({
  layout: 'app'
});

const route = useRoute();
const policyId = route.params.id as string;
const isEditing = ref(false);

// Define types
interface Policy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  documentType: string;
  content: string;
}

// Dummy data for the policy
const policy = ref<Policy>({
  id: policyId,
  name: 'PII Data Protection Policy',
  description: 'Guidelines for handling personally identifiable information',
  status: 'draft',
  lastUpdated: '2023-12-01',
  documentType: 'PDF',
  content: `# PII Data Protection Policy

## Purpose
This policy establishes guidelines for the handling of Personally Identifiable Information (PII) within our organization.

## Scope
This policy applies to all employees, contractors, and third parties with access to PII data.

## Policy Statement
1. All PII data must be encrypted both at rest and in transit.
2. Access to PII data must be limited to authorized personnel only.
3. Regular audits of PII data access shall be conducted.
4. Any breach involving PII data must be reported immediately.

## Definitions
- **PII (Personally Identifiable Information)**: Any data that could potentially identify a specific individual.
- **Data Controller**: The entity that determines the purposes, conditions, and means of the processing of personal data.
- **Data Processor**: The entity that processes data on behalf of the Data Controller.

## Responsibilities
- **Data Protection Officer (DPO)**: Oversees the data protection strategy and implementation.
- **IT Department**: Implements technical measures to protect PII.
- **Department Managers**: Ensure staff compliance with this policy.
- **All Staff**: Follow procedures for handling PII.

## Data Handling Procedures
1. **Collection**: Only collect PII that is necessary for specified purposes.
2. **Storage**: Store PII in authorized, secure systems with appropriate access controls.
3. **Usage**: Use PII only for the purposes for which it was collected.
4. **Transfer**: Transfer PII only through secure channels.
5. **Retention**: Retain PII only as long as necessary.
6. **Disposal**: Securely dispose of PII when no longer needed.

## Compliance Monitoring
- Regular audits will be conducted to ensure compliance with this policy.
- Non-compliance may result in disciplinary action.

## Policy Review
This policy will be reviewed annually or when significant changes occur in relevant regulations.`
});

// Setup breadcrumbs
const { $breadcrumbs } = useNuxtApp();
if ($breadcrumbs) {
  $breadcrumbs.value = [
    { label: 'Policies', link: '/policies' },
    { label: policy.value.name, link: `/policies/${policyId}` }
  ];
}

// Setup markdown renderer instance without registering it to Nuxt yet
const markdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// Create a computed property to render markdown
const renderedContent = computed(() => {
  return markdownIt.render(policy.value.content);
});

// Toggle editing mode
function toggleEditing() {
  isEditing.value = !isEditing.value;
}

// Save policy changes
function savePolicy() {
  isEditing.value = false;
  policy.value.lastUpdated = new Date().toISOString().split('T')[0];
  
  useSonner.success('Policy updated', {
    description: 'Your policy has been updated successfully.'
  });
}

// Convert policy to Colang
function convertToColang() {
  navigateTo(`/policies/${policyId}/convert`);
}

// Archive policy
function archivePolicy() {
  policy.value.status = 'archived';
  
  useSonner.success('Policy archived', {
    description: 'Your policy has been archived successfully.'
  });
}

// Activate policy
function activatePolicy() {
  policy.value.status = 'active';
  
  useSonner.success('Policy activated', {
    description: 'Your policy has been activated successfully.'
  });
}

// Get status badge color
const getStatusColor = computed(() => {
  switch (policy.value.status) {
    case 'active':
      return {
        bg: 'bg-green-50 dark:bg-green-950',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-900',
        icon: 'lucide:check-circle',
        iconColor: 'text-green-600 dark:text-green-500'
      };
    case 'draft':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-900',
        icon: 'lucide:file-text',
        iconColor: 'text-amber-600 dark:text-amber-500'
      };
    case 'archived':
      return {
        bg: 'bg-slate-50 dark:bg-slate-950',
        text: 'text-slate-700 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-900',
        icon: 'lucide:archive',
        iconColor: 'text-slate-600 dark:text-slate-500'
      };
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-950',
        text: 'text-slate-700 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-900',
        icon: 'lucide:help-circle',
        iconColor: 'text-slate-600 dark:text-slate-500'
      };
  }
});

useSeoMeta({ title: `${policy.value.name} - Rizk AI Compliance Platform` });
</script>

<template>
  <div class="col-span-3 space-y-6">
    <!-- Page header with improved visual hierarchy -->
    <header class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <UiButton variant="outline" size="sm" class="h-9 w-9 p-0" as="a" href="/policies">
            <Icon name="lucide:arrow-left" class="h-4 w-4" />
            <span class="sr-only">Back</span>
          </UiButton>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold tracking-tight">{{ policy.name }}</h1>
              <UiBadge 
                variant="outline"
                :class="`${getStatusColor.bg} ${getStatusColor.text} ${getStatusColor.border}`"
              >
                <Icon :name="getStatusColor.icon" class="mr-1 h-3.5 w-3.5" :class="getStatusColor.iconColor" />
                {{ policy.status.charAt(0).toUpperCase() + policy.status.slice(1) }}
              </UiBadge>
            </div>
            <p class="text-muted-foreground mt-1 line-clamp-2">
              {{ policy.description }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 self-end sm:self-auto">
          <UiButton v-if="!isEditing" @click="toggleEditing" variant="outline">
            <Icon name="lucide:pencil" class="mr-2 h-4 w-4" />
            Edit
          </UiButton>
          <UiButton v-else @click="savePolicy" variant="default">
            <Icon name="lucide:save" class="mr-2 h-4 w-4" />
            Save
          </UiButton>
        </div>
      </div>
      
      <!-- Key info bar -->
      <UiCard class="border-dashed">
        <UiCardContent class="p-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Icon name="lucide:calendar" class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Last Updated</p>
                <p class="text-sm font-medium">{{ policy.lastUpdated }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Icon name="lucide:file-type" class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Document Type</p>
                <p class="text-sm font-medium">{{ policy.documentType }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Icon name="lucide:git-branch" class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Current Version</p>
                <p class="text-sm font-medium">v1.2</p>
              </div>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main content with improved focus -->
      <div class="lg:col-span-2 space-y-6">
        <UiCard class="overflow-hidden border-none shadow-lg">
          <UiCardHeader class="bg-muted/50 border-b px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <UiCardTitle>Policy Content</UiCardTitle>
                <UiCardDescription>
                  {{ isEditing ? 'Edit the policy content below' : 'Review the current policy content' }}
                </UiCardDescription>
              </div>
              <UiBadge variant="outline" size="sm" class="px-2 py-0 h-6">
                <Icon name="lucide:eye" class="mr-1 h-3 w-3" v-if="!isEditing" />
                <Icon name="lucide:edit-3" class="mr-1 h-3 w-3" v-else />
                {{ isEditing ? 'Editing' : 'Viewing' }}
              </UiBadge>
            </div>
          </UiCardHeader>
          <UiCardContent class="p-0">
            <UiTextarea v-if="isEditing"
              v-model="policy.content"
              class="min-h-[600px] font-mono text-sm border-0 rounded-none"
            />
            <div v-else class="prose dark:prose-invert max-w-none p-6">
              <div v-html="renderedContent"></div>
            </div>
          </UiCardContent>
        </UiCard>
      </div>

      <!-- Side panel with enhanced cards -->
      <div class="space-y-6">
        <!-- Actions card -->
        <UiCard class="overflow-hidden">
          <UiCardHeader class="bg-muted/50 border-b px-5 py-3">
            <UiCardTitle class="text-base">Actions</UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="p-5">
            <div class="flex flex-col gap-2">
              <UiButton
                v-if="policy.status !== 'active'"
                @click="activatePolicy"
                variant="default"
                class="w-full justify-start"
              >
                <Icon name="lucide:check-circle" class="mr-2 h-4 w-4" />
                Activate Policy
              </UiButton>
              <UiButton
                v-if="policy.status !== 'archived'"
                @click="archivePolicy"
                variant="outline"
                class="w-full justify-start"
              >
                <Icon name="lucide:archive" class="mr-2 h-4 w-4" />
                Archive Policy
              </UiButton>
              <UiButton
                @click="convertToColang"
                variant="outline"
                class="w-full justify-start"
              >
                <Icon name="lucide:code" class="mr-2 h-4 w-4" />
                Convert to Colang
              </UiButton>
              <UiButton
                variant="ghost"
                class="w-full justify-start"
                as="a"
                href="#"
              >
                <Icon name="lucide:printer" class="mr-2 h-4 w-4" />
                Print Policy
              </UiButton>
              <UiButton
                variant="ghost"
                class="w-full justify-start"
                as="a"
                href="#"
              >
                <Icon name="lucide:download" class="mr-2 h-4 w-4" />
                Export as PDF
              </UiButton>
            </div>
          </UiCardContent>
        </UiCard>

        <!-- Version history with improved timeline -->
        <UiCard class="overflow-hidden">
          <UiCardHeader class="bg-muted/50 border-b px-5 py-3">
            <UiCardTitle class="text-base">Version History</UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="p-0">
            <div class="divide-y">
              <div class="p-4 hover:bg-muted/20 transition-colors">
                <div class="flex gap-3">
                  <div class="relative">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Icon name="lucide:git-commit" class="h-4 w-4" />
                    </div>
                    <div class="absolute top-10 bottom-0 left-4 w-px bg-border -ml-px"></div>
                  </div>
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">Current Version</span>
                      <UiBadge variant="outline" class="text-xs">v1.2</UiBadge>
                    </div>
                    <span class="text-xs text-muted-foreground">Last updated on {{ policy.lastUpdated }}</span>
                    <p class="text-xs text-muted-foreground mt-1">Added encryption requirements</p>
                  </div>
                </div>
              </div>
              
              <div class="p-4 hover:bg-muted/20 transition-colors">
                <div class="flex gap-3">
                  <div class="relative">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">
                      <Icon name="lucide:git-commit" class="h-4 w-4" />
                    </div>
                    <div class="absolute top-10 bottom-0 left-4 w-px bg-border -ml-px"></div>
                  </div>
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">Previous Version</span>
                      <UiBadge variant="outline" class="text-xs">v1.1</UiBadge>
                    </div>
                    <span class="text-xs text-muted-foreground">Updated on 2023-11-15</span>
                    <p class="text-xs text-muted-foreground mt-1">Revised user access controls</p>
                  </div>
                </div>
              </div>
              
              <div class="p-4 hover:bg-muted/20 transition-colors">
                <div class="flex gap-3">
                  <div class="relative">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">
                      <Icon name="lucide:git-commit" class="h-4 w-4" />
                    </div>
                  </div>
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">Initial Version</span>
                      <UiBadge variant="outline" class="text-xs">v1.0</UiBadge>
                    </div>
                    <span class="text-xs text-muted-foreground">Created on 2023-10-01</span>
                    <p class="text-xs text-muted-foreground mt-1">Initial policy draft</p>
                  </div>
                </div>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
        
        <!-- Related policies card (new) -->
        <UiCard class="overflow-hidden">
          <UiCardHeader class="bg-muted/50 border-b px-5 py-3">
            <UiCardTitle class="text-base">Related Policies</UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="p-0">
            <div class="divide-y">
              <a href="#" class="block p-4 hover:bg-muted/20 transition-colors">
                <div class="flex items-center gap-3">
                  <Icon name="lucide:file-text" class="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p class="font-medium text-sm">Data Retention Policy</p>
                    <p class="text-xs text-muted-foreground">Last updated 2023-11-20</p>
                  </div>
                </div>
              </a>
              <a href="#" class="block p-4 hover:bg-muted/20 transition-colors">
                <div class="flex items-center gap-3">
                  <Icon name="lucide:file-text" class="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p class="font-medium text-sm">GDPR Compliance Guidelines</p>
                    <p class="text-xs text-muted-foreground">Last updated 2023-10-15</p>
                  </div>
                </div>
              </a>
            </div>
          </UiCardContent>
        </UiCard>
      </div>
    </div>
  </div>
</template> 