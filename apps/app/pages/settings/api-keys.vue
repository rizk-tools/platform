<template>
  <div class="col-span-3 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">API Keys</h1>
        <p class="text-sm text-muted-foreground">
          Manage API keys that allow secure access to the Rizk API
        </p>
      </div>
      <UiButton variant="default" @click="showCreateKeyDialog = true">
        Create API Key
      </UiButton>
    </div>

    <!-- API Keys List -->
    <div class="rounded-lg border bg-card">
      <div class="p-6">
        <div v-if="loading" class="flex flex-col items-center justify-center py-8 text-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Icon name="lucide:loader" class="size-10 text-muted-foreground animate-spin" />
          </div>
          <h3 class="mt-4 text-lg font-medium">Loading API keys...</h3>
        </div>

        <div v-else-if="errorMsg" class="flex flex-col items-center justify-center py-8 text-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <Icon name="lucide:alert-triangle" class="size-10 text-destructive" />
          </div>
          <h3 class="mt-4 text-lg font-medium">Error loading API keys</h3>
          <p class="mt-2 text-sm text-muted-foreground max-w-md">{{ errorMsg }}</p>
          <UiButton variant="outline" class="mt-4" @click="refreshData">
            Try Again
          </UiButton>
        </div>

        <div v-else-if="!apiKeys.length" class="flex flex-col items-center justify-center py-8 text-center">
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Icon name="lucide:key" class="size-10 text-muted-foreground" />
          </div>
          <h3 class="mt-4 text-lg font-medium">No API keys yet</h3>
          <p class="mt-2 text-sm text-muted-foreground max-w-md">
            API keys allow your applications to authenticate with the Rizk API. Create your first key to start building
            integrations.
          </p>
          <UiButton variant="outline" class="mt-4" @click="showCreateKeyDialog = true">
            Create API Key
          </UiButton>
        </div>

        <div v-else class="space-y-5">
          <!-- Key item -->
          <div v-for="key in apiKeys" :key="key.id"
            class="flex items-center justify-between space-x-4 rounded-lg border p-4">
            <div class="flex items-center space-x-4">
              <div class="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Icon name="lucide:key" class="size-5 text-primary" />
              </div>
              <div>
                <p class="font-medium">{{ key.name }}</p>
                <p class="text-xs text-muted-foreground">
                  Created {{ new Date(key.metadata?.createdAt || key.createdAt).toLocaleDateString() }}
                  <template v-if="key.expiresAt">
                    · Expires {{ new Date(key.expiresAt).toLocaleDateString() }}
                  </template>
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <UiDropdownMenu>
                <UiDropdownMenuTrigger as-child>
                  <UiButton variant="ghost" size="icon">
                    <Icon name="lucide:more-vertical" class="size-4" />
                  </UiButton>
                </UiDropdownMenuTrigger>
                <UiDropdownMenuContent>
                  <UiDropdownMenuItem @click="revokeKey(key.id)">
                    <Icon name="lucide:trash-2" class="mr-2 size-4" /> Revoke API Key
                  </UiDropdownMenuItem>
                </UiDropdownMenuContent>
              </UiDropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create API Key Dialog -->
    <UiSheet v-model:open="showCreateKeyDialog">
      <UiSheetContent class="sm:max-w-md">
        <UiSheetHeader>
          <UiSheetTitle>Create API Key</UiSheetTitle>
          <UiSheetDescription>
            Generate a new API key for secure access to the Rizk API
          </UiSheetDescription>
        </UiSheetHeader>

        <div class="mt-6 space-y-4">
          <div class="space-y-2">
            <UiLabel for="api-key-name">API Key Name</UiLabel>
            <UiInput id="api-key-name" v-model="newKeyName" placeholder="e.g. Production Server" />
            <p class="text-xs text-muted-foreground">Give your API key a memorable name to identify its purpose.</p>
          </div>

          <div class="space-y-2">
            <UiLabel for="api-key-expiry">Expiration</UiLabel>

            <UiSelect v-model="expiry">
              <UiSelectTrigger placeholder="Select an option" />
              <UiSelectContent>
                <UiSelectLabel>Expiration</UiSelectLabel>
                <UiSelectSeparator />
                <UiSelectGroup>
                  <UiSelectItem v-for="(option, i) in expiryOptions" :key="i" :value="option.value"
                    :text="option.label" />
                </UiSelectGroup>
              </UiSelectContent>
            </UiSelect>




          </div>
        </div>

        <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <UiButton variant="outline" @click="showCreateKeyDialog = false">Cancel</UiButton>
          <UiButton variant="default" :disabled="creatingKey" @click="handleCreateKey">
            <Icon v-if="creatingKey" name="lucide:loader" class="mr-2 size-4 animate-spin" />
            Create API Key
          </UiButton>
        </div>
      </UiSheetContent>
    </UiSheet>

    <!-- API Key Created Dialog -->
    <UiSheet v-model:open="showKeyCreatedDialog">
      <UiSheetContent class="sm:max-w-md">
        <UiSheetHeader>
          <UiSheetTitle>API Key Created</UiSheetTitle>
          <UiSheetDescription>
            Your new API key has been created. Make sure to copy it now as you won't be able to see it again.
          </UiSheetDescription>
        </UiSheetHeader>

        <div class="mt-6 space-y-4">
          <div class="space-y-2">
            <UiLabel>API Key</UiLabel>
            <div class="flex items-center space-x-2">
              <div class="relative flex-1">
                <UiInput :value="newApiKey" readonly class="pr-10 font-mono text-sm" />
                <button class="absolute right-2 top-1/2 -translate-y-1/2" title="Copy to clipboard"
                  @click="copyToClipboard(newApiKey)">
                  <Icon name="lucide:copy" class="size-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>
            <p class="text-xs text-destructive font-medium">
              This key will only be displayed once and cannot be retrieved later.
            </p>
          </div>
        </div>

        <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <UiButton variant="default" @click="showKeyCreatedDialog = false">Done</UiButton>
        </div>
      </UiSheetContent>
    </UiSheet>
  </div>



</template>

<script setup lang="ts">
import { useQuery, useMutation, useQueryCache } from '@pinia/colada';
import { auth } from '@/lib/auth';

const expiry = ref('never');
const expiryOptions = ref([
  { label: 'Never expires', value: 'never' },
  { label: '30 days', value: '30d' },
  { label: '60 days', value: '60d' },
  { label: '90 days', value: '90d' },
  { label: '180 days', value: '180d' },
  { label: '365 days', value: '365d' },
]);
definePageMeta({
  layout: 'app',
});

// Set breadcrumbs for this page
const { $breadcrumbs } = useNuxtApp();

if ($breadcrumbs) {
  $breadcrumbs.value = [
    { label: "Settings", link: "/settings" },
    { label: "API Keys", link: "/settings/api-keys" },
  ];
}

// Using Pinia Colada for state management
const queryCache = useQueryCache();

// Query for getting API keys
const apiKeysQuery = useQuery({
  key: ['api-keys'],
  query: async () => {
    const { data, error } = await auth.apiKey.list();

    if (error) {
      throw error;
    }

    return data || [];
  }
});

// Create computed properties for easier template access
const apiKeys = computed(() => apiKeysQuery.data.value || []);
const loading = computed(() => apiKeysQuery.asyncStatus.value === 'loading');
const errorMsg = computed(() => apiKeysQuery.error.value?.message || '');

// Function to refresh the data
function refreshData () {
  apiKeysQuery.refresh();
}

// State for UI
const showCreateKeyDialog = ref(false);
const showKeyCreatedDialog = ref(false);
const newKeyName = ref('');
const newApiKey = ref('');

// // Mutation for creating a new API key
const createKeyMutation = useMutation({
  mutation: async () => {
    // Calculate expiration time in seconds
    let expiresIn = null;
    if (expiry.value !== 'never') {
      const days = parseInt(expiry.value.replace('d', ''));
      expiresIn = days * 24 * 60 * 60; // Convert days to seconds
    }

    const { data, error } = await auth.apiKey.create({
      name: newKeyName.value,
      expiresIn,
      prefix: 'rizk_'
    });

    if (error) {
      throw error;
    }

    return data;
  },
  onSuccess: (data: { key: string }) => {
    // Store the newly created API key to display to the user
    newApiKey.value = data.key;

    // Copy the API key to the clipboard
    copyToClipboard(data.key);

    // Close create dialog and open the created dialog
    showCreateKeyDialog.value = false;
    showKeyCreatedDialog.value = true;

    // Invalidate the API keys query to refresh the list
    queryCache.invalidateQueries({ key: ['api-keys'] });
  },
  onError: (error: Error) => {
    alert(error.message || 'Failed to create API key');
  }
});

// Computed property for loading state
const creatingKey = computed(() => createKeyMutation.asyncStatus.value === 'loading');

// Function to handle creating a new API key
function handleCreateKey () {
  createKeyMutation.mutate();
}

// Mutation for revoking an API key
const revokeKeyMutation = useMutation({
  mutation: async (keyId: string) => {
    const { error } = await auth.apiKey.delete({ keyId });

    if (error) {
      throw error;
    }

    return { success: true };
  },
  onSuccess: () => {
    // Invalidate the API keys query to refresh the list
    queryCache.invalidateQueries({ key: ['api-keys'] });
  },
  onError: (error: Error) => {
    alert(error.message || 'Failed to revoke API key');
  }
});

// Function to revoke a key
function revokeKey (keyId: string) {
  revokeKeyMutation.mutate(keyId);
}

// Function to copy API key to clipboard
function copyToClipboard (text: string) {
  navigator.clipboard.writeText(text)
    .then(() => {
      useSonner.success("API Key copied to clipboard", {
        description: "You can now paste it into your application.",
      });
    })
    .catch((error: Error) => {
      useSonner.error("Failed to copy API Key", {
        description: "Please try again.",
      });

      console.error('Failed to copy text: ', error);
    });
}
</script>