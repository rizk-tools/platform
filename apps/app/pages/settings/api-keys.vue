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
        <div v-if="apiKeys.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
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
                <p class="text-xs text-muted-foreground">Created {{ key.createdAt }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <UiTooltipProvider>
                <UiTooltip>
                  <UiTooltipTrigger as-child>
                    <UiButton variant="ghost" size="icon">
                      <Icon name="lucide:copy" class="size-4" />
                    </UiButton>
                  </UiTooltipTrigger>
                  <UiTooltipContent>
                    <p>Copy API Key</p>
                  </UiTooltipContent>
                </UiTooltip>
              </UiTooltipProvider>

              <UiDropdownMenu>
                <UiDropdownMenuTrigger as-child>
                  <UiButton variant="ghost" size="icon">
                    <Icon name="lucide:more-vertical" class="size-4" />
                  </UiButton>
                </UiDropdownMenuTrigger>
                <UiDropdownMenuContent>
                  <UiDropdownMenuItem icon="lucide:trash-2" title="Revoke API Key" />
                </UiDropdownMenuContent>
              </UiDropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create API Key Dialog -->
    <UiSheetRoot v-model:open="showCreateKeyDialog">
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
            <select id="api-key-expiry"
              class="form-select h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <option value="never">Never expires</option>
              <option value="30d">30 days</option>
              <option value="60d">60 days</option>
              <option value="90d">90 days</option>
              <option value="180d">6 months</option>
              <option value="365d">1 year</option>
            </select>
          </div>

          <div class="space-y-2">
            <UiLabel>Permissions</UiLabel>
            <div class="rounded-lg border p-4 space-y-3">
              <div class="flex items-center space-x-2">
                <input id="read-permission" type="checkbox"
                  class="form-checkbox h-4 w-4 rounded border-primary text-primary focus:ring-primary/20" checked>
                <label for="read-permission" class="text-sm font-medium">Read</label>
                <span class="ml-auto text-xs text-muted-foreground">View policy information</span>
              </div>

              <div class="flex items-center space-x-2">
                <input id="write-permission" type="checkbox"
                  class="form-checkbox h-4 w-4 rounded border-primary text-primary focus:ring-primary/20">
                <label for="write-permission" class="text-sm font-medium">Write</label>
                <span class="ml-auto text-xs text-muted-foreground">Create and edit policies</span>
              </div>

              <div class="flex items-center space-x-2">
                <input id="evaluate-permission" type="checkbox"
                  class="form-checkbox h-4 w-4 rounded border-primary text-primary focus:ring-primary/20" checked>
                <label for="evaluate-permission" class="text-sm font-medium">Evaluate</label>
                <span class="ml-auto text-xs text-muted-foreground">Run policy evaluations</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <UiButton variant="outline" @click="showCreateKeyDialog = false">Cancel</UiButton>
          <UiButton variant="default" @click="createApiKey">Create API Key</UiButton>
        </div>
      </UiSheetContent>
    </UiSheetRoot>

    <!-- API Key Created Dialog -->
    <UiSheetRoot v-model:open="showKeyCreatedDialog">
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
                <UiInput value="rizk_sk_1234567890abcdefghijklmnopqrstuvwxyz" readonly
                  class="pr-10 font-mono text-sm" />
                <button class="absolute right-2 top-1/2 -translate-y-1/2" title="Copy to clipboard">
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
    </UiSheetRoot>
  </div>
</template>

<script setup lang="ts">
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

// This is just UI design, implementation will come later
const showCreateKeyDialog = ref(false);
const showKeyCreatedDialog = ref(false);
const newKeyName = ref('');

// Sample data for the UI design
const apiKeys = ref([
  {
    id: '1',
    name: 'Development Server',
    value: 'rizk_sk_1234567890abcdefghijklmnopqrstuvwxyz',
    createdAt: 'April 23, 2024'
  }
]);

// Mock function that will be implemented later
const createApiKey = () => {
  // This is just for the UI design
  showCreateKeyDialog.value = false;
  showKeyCreatedDialog.value = true;
};
</script>