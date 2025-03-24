<script setup lang="ts">
const items = [
  {
    label: "General",
    to: "/settings/general",
    icon: "lucide:settings",
  },
  {
    label: "Team",
    to: "/settings/team",
    icon: "lucide:users",
  },
  {
    label: "Billing",
    to: "/settings/billing",
    icon: "lucide:credit-card",
  },
  {
    label: "API Keys",
    to: "/settings/api-keys",
    icon: "lucide:key-round",
  },
];

const route = useRoute();

function isActive(path: string) {
  return route.path === path;
}
</script>

<template>
 <div class="col-span-3 space-y-6">
    <h1 class="text-2xl font-semibold">Settings</h1>
    <p class="text-sm text-muted-foreground">Manage your account settings and preferences</p>

    <UiSeparator />

    <div class="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-x-12 lg:space-y-0">
      <div class="flex gap-1 flex-col max-w-40 w-full">
        <NuxtLink 
          v-for="item in items" 
          :key="item.to"
          :to="item.to" 
          :class="[
            'group inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 py-2 justify-start gap-4 px-3',
            isActive(item.to) ? 'bg-accent text-accent-foreground' : ''
          ]"
        >
          <Icon :name="item.icon" class="size-4" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </div>

      <div class="w-full flex-1">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>