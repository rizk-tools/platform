<script setup lang="ts">
import { useNuxtApp } from '#app';

definePageMeta({
  layout: 'app'
});

// Define types
interface Policy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  documentType: string;
}

// Dummy data for policies
const policies = ref<Policy[]>([
  {
    id: '1',
    name: 'PII Data Protection Policy',
    description: 'Guidelines for handling personally identifiable information',
    status: 'active',
    lastUpdated: '2023-12-01',
    documentType: 'PDF'
  },
  {
    id: '2',
    name: 'Responsible AI Usage Policy',
    description: 'Ethical guidelines for AI systems deployment',
    status: 'active',
    lastUpdated: '2023-11-15',
    documentType: 'DOCX'
  },
  {
    id: '3',
    name: 'GDPR Compliance Framework',
    description: 'Policies for EU data protection regulation compliance',
    status: 'draft',
    lastUpdated: '2023-10-28',
    documentType: 'PDF'
  },
  {
    id: '4',
    name: 'AI Model Security Policy',
    description: 'Security measures for AI model deployment',
    status: 'draft',
    lastUpdated: '2023-10-10',
    documentType: 'TXT'
  },
  {
    id: '5',
    name: 'Healthcare Data Policy',
    description: 'Guidelines for handling sensitive healthcare information',
    status: 'archived',
    lastUpdated: '2023-09-05',
    documentType: 'PDF'
  }
]);

const { $breadcrumbs } = useNuxtApp();
if ($breadcrumbs) {
  $breadcrumbs.value = [
    { label: 'Policies', link: '/policies' },
    { label: 'All Policies', link: '/policies' }
  ];
}

function navigateToPolicy(id: string) {
  navigateTo(`/policies/${id}`);
}

function getStatusColor(status: Policy['status']) {
  switch (status) {
    case 'active':
      return 'text-green-700 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-950 dark:border-green-900';
    case 'draft':
      return 'text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-900';
    case 'archived':
      return 'text-slate-700 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-950 dark:border-slate-900';
    default:
      return '';
  }
}

useSeoMeta({ title: 'All Policies - Rizk AI Compliance Platform' });
</script>

<template>
  <div class="md:col-span-3 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Policies</h1>
        <p class="text-muted-foreground">
          Manage your AI compliance policies
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UiButton size="sm" variant="outline">
          <Icon name="lucide:filter" class="mr-2 h-4 w-4" />
          Filter
        </UiButton>
        <UiButton size="sm" as="a" href="/policies/create">
          <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
          New Policy
        </UiButton>
      </div>
    </div>

    <UiCard>
      <UiCardHeader class="px-6 pb-4">
        <div class="flex items-center justify-between">
          <UiCardTitle>All Policies</UiCardTitle>
          <UiInput placeholder="Search policies..." class="max-w-xs">
            <template #prefix>
              <Icon name="lucide:search" class="h-4 w-4 text-muted-foreground" />
            </template>
          </UiInput>
        </div>
      </UiCardHeader>
      <UiCardContent class="px-6">
        <UiTable>
          <UiTableHeader>
            <UiTableRow>
              <UiTableHead>Name</UiTableHead>
              <UiTableHead>Status</UiTableHead>
              <UiTableHead>Last Updated</UiTableHead>
              <UiTableHead>Document Type</UiTableHead>
              <UiTableHead class="text-right">Actions</UiTableHead>
            </UiTableRow>
          </UiTableHeader>
          <UiTableBody>
            <UiTableRow v-for="policy in policies" :key="policy.id" class="cursor-pointer" @click="navigateToPolicy(policy.id)">
              <UiTableCell class="font-medium">
                <div>
                  <div>{{ policy.name }}</div>
                  <div class="text-sm text-muted-foreground truncate max-w-md">{{ policy.description }}</div>
                </div>
              </UiTableCell>
              <UiTableCell>
                <UiBadge :class="getStatusColor(policy.status)" variant="outline">
                  {{ policy.status.charAt(0).toUpperCase() + policy.status.slice(1) }}
                </UiBadge>
              </UiTableCell>
              <UiTableCell>{{ policy.lastUpdated }}</UiTableCell>
              <UiTableCell>{{ policy.documentType }}</UiTableCell>
              <UiTableCell class="text-right">
                <UiDropdownMenu>
                  <UiDropdownMenuTrigger as-child @click.stop>
                    <UiButton variant="ghost" size="icon">
                      <Icon name="lucide:more-horizontal" class="h-4 w-4" />
                      <span class="sr-only">Open menu</span>
                    </UiButton>
                  </UiDropdownMenuTrigger>
                  <UiDropdownMenuContent align="end">
                    <UiDropdownMenuItem @click.stop="navigateToPolicy(policy.id)">
                      <Icon name="lucide:eye" class="mr-2 h-4 w-4" />
                      View
                    </UiDropdownMenuItem>
                    <UiDropdownMenuItem @click.stop="navigateTo(`/policies/${policy.id}/edit`)">
                      <Icon name="lucide:pencil" class="mr-2 h-4 w-4" />
                      Edit
                    </UiDropdownMenuItem>
                    <UiDropdownMenuItem @click.stop="navigateTo(`/policies/${policy.id}/convert`)">
                      <Icon name="lucide:code" class="mr-2 h-4 w-4" />
                      Convert to Colang
                    </UiDropdownMenuItem>
                    <UiDropdownMenuSeparator />
                    <UiDropdownMenuItem @click.stop class="text-destructive focus:text-destructive">
                      <Icon name="lucide:trash-2" class="mr-2 h-4 w-4" />
                      Delete
                    </UiDropdownMenuItem>
                  </UiDropdownMenuContent>
                </UiDropdownMenu>
              </UiTableCell>
            </UiTableRow>
          </UiTableBody>
        </UiTable>
      </UiCardContent>
    </UiCard>
  </div>
</template> 