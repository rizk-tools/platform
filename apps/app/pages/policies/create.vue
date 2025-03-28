<script setup lang="ts">
import { useNuxtApp } from '#app';

definePageMeta({
  layout: 'app'
});

// Form state
const policyForm = ref({
  name: '',
  description: '',
  documentFile: null as File | null,
});

// Upload states
const isUploading = ref(false);
const uploadProgress = ref(0);
const documentContent = ref('');
const isProcessing = ref(false);

// Setup breadcrumbs
const { $breadcrumbs } = useNuxtApp();
if ($breadcrumbs) {
  $breadcrumbs.value = [
    { label: 'Policies', link: '/policies' },
    { label: 'Create Policy', link: '/policies/create' }
  ];
}

// Handle file selection
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    policyForm.value.documentFile = target.files[0];
  }
}

// Simulate document upload and processing
async function handleUpload() {
  if (!policyForm.value.documentFile) return;
  
  isUploading.value = true;
  uploadProgress.value = 0;
  
  // Simulate upload progress
  const interval = setInterval(() => {
    uploadProgress.value += Math.random() * 10;
    if (uploadProgress.value >= 100) {
      uploadProgress.value = 100;
      clearInterval(interval);
      simulateProcessing();
    }
  }, 300);
}

// Simulate AI processing of document
function simulateProcessing() {
  isUploading.value = false;
  isProcessing.value = true;
  
  // Simulate AI extraction delay
  setTimeout(() => {
    // Generate dummy content based on uploaded file type
    const fileName = policyForm.value.documentFile?.name || '';
    
    if (fileName.endsWith('.pdf')) {
      documentContent.value = `# PII Data Protection Policy\n\n## Purpose\nThis policy establishes guidelines for the handling of Personally Identifiable Information (PII) within our organization.\n\n## Scope\nThis policy applies to all employees, contractors, and third parties with access to PII data.\n\n## Policy Statement\n1. All PII data must be encrypted both at rest and in transit.\n2. Access to PII data must be limited to authorized personnel only.\n3. Regular audits of PII data access shall be conducted.\n4. Any breach involving PII data must be reported immediately.`;
    } else if (fileName.endsWith('.docx')) {
      documentContent.value = `# Responsible AI Usage Policy\n\n## Introduction\nThis policy outlines the ethical guidelines for deploying AI systems within our organization.\n\n## Core Principles\n- Transparency: AI systems must be explainable\n- Fairness: AI systems must not discriminate\n- Accountability: Clear ownership for AI systems\n- Privacy: Data used by AI systems must protect user privacy\n\n## Implementation\nAll AI models must undergo ethical review before deployment.`;
    } else {
      documentContent.value = `# Generic Policy Document\n\nThis document was extracted from your uploaded file. Our AI has processed the content and identified key policy elements.\n\n## Policy Elements\n- Compliance requirements\n- Implementation guidelines\n- Monitoring procedures\n- Reporting mechanisms`;
    }
    
    isProcessing.value = false;
  }, 3000);
}

// Create policy submission
function handleSubmit() {
  // Simulate form submission
  useSonner.success('Policy created successfully', {
    description: `${policyForm.value.name} has been created and is now in draft status.`
  });
  
  // Reset form after submission
  setTimeout(() => {
    navigateTo('/policies');
  }, 2000);
}

useSeoMeta({ title: 'Create Policy - Rizk AI Compliance Platform' });
</script>

<template>
  <div class="md:col-span-3 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Create Policy</h1>
        <p class="text-muted-foreground">
          Upload a document to create a new compliance policy
        </p>
      </div>
      <UiButton variant="outline" as="a" href="/policies">
        <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
        Back to Policies
      </UiButton>
    </div>

    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Policy Information</UiCardTitle>
        <UiCardDescription>
          Provide basic information about this policy
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <form class="space-y-4">
          <div class="grid gap-2">
            <UiLabel for="name" required>Policy Name</UiLabel>
            <UiInput id="name" v-model="policyForm.name" placeholder="e.g. PII Data Protection Policy" required />
          </div>
          <div class="grid gap-2">
            <UiLabel for="description">Description</UiLabel>
            <UiTextarea id="description" v-model="policyForm.description" placeholder="Briefly describe the purpose of this policy" />
          </div>
        </form>
      </UiCardContent>
    </UiCard>

    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Document Upload</UiCardTitle>
        <UiCardDescription>
          Upload a document containing your policy text. We support PDF, DOCX, and TXT files.
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <div class="space-y-4">
          <div class="rounded-lg border border-dashed p-8 text-center" v-if="!policyForm.documentFile && !isUploading">
            <div class="mx-auto flex max-w-[420px] flex-col items-center justify-center">
              <Icon name="lucide:file-text" class="h-10 w-10 text-muted-foreground" />
              <h3 class="mt-4 text-lg font-semibold">Upload your policy document</h3>
              <p class="mt-2 text-sm text-muted-foreground">
                Drag and drop your document here or click to browse your files
              </p>
              <label for="file-upload" class="mt-4 cursor-pointer">
                <UiButton type="button" variant="outline">
                  <Icon name="lucide:upload" class="mr-2 h-4 w-4" />
                  Select File
                </UiButton>
                <input id="file-upload" type="file" class="hidden" accept=".pdf,.docx,.txt" @change="handleFileChange" />
              </label>
            </div>
          </div>
          
          <div v-else-if="isUploading" class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="rounded-md bg-muted p-2">
                <Icon name="lucide:file-text" class="h-6 w-6" />
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium">{{ policyForm.documentFile?.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ Math.round(uploadProgress) }}%</p>
                </div>
                <UiProgress :value="uploadProgress" class="h-1 w-full" />
              </div>
            </div>
          </div>
          
          <div v-else-if="isProcessing" class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="rounded-md bg-muted p-2">
                <Icon name="lucide:file-text" class="h-6 w-6" />
              </div>
              <div class="flex-1 space-y-1">
                <p class="text-sm font-medium">{{ policyForm.documentFile?.name }}</p>
                <p class="text-sm text-muted-foreground">Processing document with AI...</p>
                <UiProgress class="h-1 w-full animate-pulse" />
              </div>
            </div>
          </div>
          
          <div v-else class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="rounded-md bg-muted p-2">
                <Icon name="lucide:file-text" class="h-6 w-6" />
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium">{{ policyForm.documentFile?.name }}</p>
                  <UiButton size="sm" variant="ghost" @click="policyForm.documentFile = null; documentContent = ''">
                    <Icon name="lucide:x" class="h-4 w-4" />
                  </UiButton>
                </div>
                <p class="text-sm text-muted-foreground">Document processed successfully</p>
              </div>
            </div>
          </div>
          
          <UiButton v-if="policyForm.documentFile && !isUploading && !isProcessing && !documentContent" 
                   @click="handleUpload">
            Process Document with AI
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>
    
    <UiCard v-if="documentContent">
      <UiCardHeader>
        <UiCardTitle>Document Content</UiCardTitle>
        <UiCardDescription>
          Review and edit the extracted policy content
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <UiTextarea v-model="documentContent" class="min-h-[300px] font-mono text-sm" />
      </UiCardContent>
    </UiCard>
    
    <div class="flex justify-end gap-4">
      <UiButton variant="outline" as="a" href="/policies">Cancel</UiButton>
      <UiButton @click="handleSubmit" :disabled="!policyForm.name || !documentContent">
        Create Policy
      </UiButton>
    </div>
  </div>
</template> 