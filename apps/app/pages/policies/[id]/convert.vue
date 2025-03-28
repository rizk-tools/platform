<script setup lang="ts">
import { useNuxtApp } from '#app';

definePageMeta({
  layout: 'app'
});

const route = useRoute();
const policyId = route.params.id as string;

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
4. Any breach involving PII data must be reported immediately.`
});

// Colang conversion states
const isConverting = ref(false);
const conversionProgress = ref(0);
const colangOutput = ref('');

// Setup breadcrumbs
const { $breadcrumbs } = useNuxtApp();
if ($breadcrumbs) {
  $breadcrumbs.value = [
    { label: 'Policies', link: '/policies' },
    { label: policy.value.name, link: `/policies/${policyId}` },
    { label: 'Convert to Colang', link: `/policies/${policyId}/convert` }
  ];
}

// Simulate conversion to Colang
function convertToColang() {
  isConverting.value = true;
  conversionProgress.value = 0;
  
  // Simulate conversion process with progress
  const interval = setInterval(() => {
    conversionProgress.value += Math.random() * 15;
    
    if (conversionProgress.value >= 100) {
      conversionProgress.value = 100;
      clearInterval(interval);
      
      // Simulate AI generating Colang
      setTimeout(() => {
        colangOutput.value = `// PII Data Protection Policy
// Converted to Colang format

schema Policy {
  name: "PII Data Protection Policy",
  version: "1.0",
  scope: ["employees", "contractors", "third_parties"],
  enforcement: "mandatory"
}

define policy PIIProtection {
  description: "Guidelines for handling personally identifiable information"
  
  rule EncryptPII {
    description: "All PII data must be encrypted"
    condition: data.contains_pii == true
    action: ensure(data.encryption_status == "encrypted")
    violation_severity: "high"
  }
  
  rule LimitPIIAccess {
    description: "Access to PII must be limited to authorized personnel"
    condition: data.contains_pii == true && user.role != "authorized"
    action: deny_access(data)
    violation_severity: "high"
  }
  
  rule AuditPIIAccess {
    description: "Regular audits of PII data access"
    condition: data.contains_pii == true && event.type == "data_access"
    action: log_access(user, data, timestamp)
    violation_severity: "medium"
  }
  
  rule ReportPIIBreach {
    description: "Report PII data breaches immediately"
    condition: event.type == "data_breach" && data.contains_pii == true
    action: [
      notify_security_team(event),
      create_incident_report(event),
      notify_affected_users(data)
    ]
    violation_severity: "critical"
  }
}

// Enforcement implementation
when ai.response.contains_pii and not ai.response.is_authorized
  apply policy.PIIProtection.LimitPIIAccess

when ai.response.contains_pii and ai.response.encryption_status != "encrypted"
  apply policy.PIIProtection.EncryptPII

when ai.event.type == "data_breach" and ai.data.contains_pii
  apply policy.PIIProtection.ReportPIIBreach`;
        
        isConverting.value = false;
      }, 2000);
    }
  }, 200);
}

// Copy Colang to clipboard
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(colangOutput.value);
    useSonner.success('Copied to clipboard', {
      description: 'Colang code has been copied to your clipboard.'
    });
  } catch (err) {
    useSonner.error('Failed to copy', {
      description: 'Could not copy text to clipboard. Please try again.'
    });
  }
}

// Download Colang file
function downloadColang() {
  const element = document.createElement('a');
  const file = new Blob([colangOutput.value], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `${policy.value.name.replace(/\s+/g, '_')}_colang.co`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  
  useSonner.success('Downloaded successfully', {
    description: 'Colang file has been downloaded to your device.'
  });
}

// Apply Colang to policy
function applyToPolicy() {
  useSonner.success('Colang code applied', {
    description: 'The Colang code has been applied to your policy and is now active.'
  });
  
  // Redirect back to policy page
  setTimeout(() => {
    navigateTo(`/policies/${policyId}`);
  }, 1500);
}

useSeoMeta({ title: `Convert ${policy.value.name} - Rizk AI Compliance Platform` });
</script>

<template>
  <div class="md:col-span-3 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Convert to Colang</h1>
        <p class="text-muted-foreground">
          Convert "{{ policy.name }}" to Colang format for AI enforcement
        </p>
      </div>
      <NuxtLink :to="`/policies/${policy.id}`">
        <UiButton variant="outline">
          <Icon name="lucide:arrow-left" class="mr-2 h-4 w-4" />
          Back to Policy
        </UiButton>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Original policy -->
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Original Policy</UiCardTitle>
          <UiCardDescription>
            The current policy in human-readable format
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="prose dark:prose-invert max-w-none">
            <div v-if="$mdRenderer" v-html="$mdRenderer.render(policy.content)"></div>
            <pre v-else class="whitespace-pre-wrap">{{ policy.content }}</pre>
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Colang output -->
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Colang Format</UiCardTitle>
          <UiCardDescription>
            AI-enforceable policy code in Colang format
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div v-if="!colangOutput && !isConverting" class="flex flex-col items-center justify-center space-y-4 p-8">
            <div class="rounded-full bg-muted p-3">
              <Icon name="lucide:code" class="h-6 w-6" />
            </div>
            <h3 class="text-lg font-semibold">Convert Policy to Colang</h3>
            <p class="text-center text-sm text-muted-foreground">
              Convert your policy to Colang format to make it enforceable by the Rizk AI compliance engine.
            </p>
            <UiButton @click="convertToColang">
              <Icon name="lucide:sparkles" class="mr-2 h-4 w-4" />
              Generate Colang Code
            </UiButton>
          </div>

          <div v-else-if="isConverting" class="space-y-4 p-4">
            <div class="flex items-center gap-4">
              <div class="rounded-md bg-muted p-2">
                <Icon name="lucide:code" class="h-6 w-6" />
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium">Converting to Colang...</p>
                  <p class="text-sm text-muted-foreground">{{ Math.round(conversionProgress) }}%</p>
                </div>
                <UiProgress :value="conversionProgress" class="h-1 w-full" />
              </div>
            </div>
            <p class="text-center text-sm text-muted-foreground animate-pulse">
              Our AI is analyzing your policy and generating Colang code...
            </p>
          </div>

          <div v-else class="space-y-4">
            <div class="relative">
              <pre class="rounded-md bg-muted p-4 text-sm font-mono overflow-auto max-h-[400px]">{{ colangOutput }}</pre>
              <div class="absolute top-2 right-2">
                <UiButton size="sm" variant="ghost" @click="copyToClipboard">
                  <Icon name="lucide:clipboard" class="h-4 w-4" />
                </UiButton>
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <UiButton variant="outline" @click="downloadColang">
                <Icon name="lucide:download" class="mr-2 h-4 w-4" />
                Download
              </UiButton>
              <UiButton @click="applyToPolicy">
                <Icon name="lucide:check" class="mr-2 h-4 w-4" />
                Apply to Policy
              </UiButton>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Explanation section -->
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>About Colang Format</UiCardTitle>
        <UiCardDescription>
          Understanding the Rizk Colang policy language
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <div class="prose dark:prose-invert max-w-none">
          <h3>What is Colang?</h3>
          <p>
            Colang is Rizk's policy language that enables the enforcement of compliance rules in AI systems. It converts human-readable policies into machine-enforceable code.
          </p>
          
          <h3>Key Components</h3>
          <ul>
            <li><strong>Schema</strong> - Defines metadata about the policy</li>
            <li><strong>Rules</strong> - Individual compliance requirements with conditions and actions</li>
            <li><strong>Enforcement</strong> - When and how to apply the rules to AI interactions</li>
          </ul>
          
          <h3>Benefits</h3>
          <ul>
            <li>Automatic enforcement of compliance policies</li>
            <li>Real-time monitoring and prevention of violations</li>
            <li>Consistent application across all AI systems</li>
            <li>Auditability and traceability of policy enforcement</li>
          </ul>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script lang="ts">
// Setup markdown renderer
export default defineComponent({
  setup() {
    const nuxtApp = useNuxtApp();
    
    // Add markdown renderer if it doesn't exist
    if (!nuxtApp.$mdRenderer) {
      const MarkdownIt = require('markdown-it');
      nuxtApp.provide('mdRenderer', new MarkdownIt());
    }
    
    return {};
  }
});
</script> 