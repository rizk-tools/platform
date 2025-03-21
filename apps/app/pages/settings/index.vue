<template>
  <div class="col-span-3 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Settings</h1>
      <p class="text-sm text-muted-foreground">
        Manage your account settings and preferences
      </p>
    </div>

    <!-- Settings Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <!-- General Settings -->
      <NuxtLink to="/settings/general"
        class="group rounded-lg border p-4 transition-all hover:border-primary hover:shadow-sm">
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted group-hover:border-primary/20 group-hover:bg-primary/10">
            <Icon name="lucide:settings" class="size-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <div>
            <h3 class="font-medium">General</h3>
            <p class="text-sm text-muted-foreground">Configure general application settings</p>
          </div>
        </div>
      </NuxtLink>

      <!-- Team Settings -->
      <NuxtLink to="/settings/team"
        class="group rounded-lg border p-4 transition-all hover:border-primary hover:shadow-sm">
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted group-hover:border-primary/20 group-hover:bg-primary/10">
            <Icon name="lucide:users" class="size-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <div>
            <h3 class="font-medium">Team</h3>
            <p class="text-sm text-muted-foreground">Manage team members and roles</p>
          </div>
        </div>
      </NuxtLink>

      <!-- Billing Settings -->
      <NuxtLink to="/settings/billing"
        class="group rounded-lg border p-4 transition-all hover:border-primary hover:shadow-sm">
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted group-hover:border-primary/20 group-hover:bg-primary/10">
            <Icon name="lucide:credit-card" class="size-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <div>
            <h3 class="font-medium">Billing</h3>
            <p class="text-sm text-muted-foreground">Manage billing and subscription plans</p>
          </div>
        </div>
      </NuxtLink>

      <!-- API Keys -->
      <NuxtLink to="/settings/api-keys"
        class="group rounded-lg border p-4 transition-all hover:border-primary hover:shadow-sm">
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted group-hover:border-primary/20 group-hover:bg-primary/10">
            <Icon name="lucide:key" class="size-6 text-muted-foreground group-hover:text-primary" />
          </div>
          <div>
            <h3 class="font-medium">API Keys</h3>
            <p class="text-sm text-muted-foreground">Manage API keys for secure API access</p>
          </div>
        </div>
      </NuxtLink>
    </div>
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
  ];
}
</script>