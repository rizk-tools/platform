<script lang="ts" setup>
definePageMeta({
  layout: "app"
})

// Define color types
type TailwindColor = 'blue' | 'amber' | 'green' | 'indigo' | 'zinc' | 'red' | 'emerald' | 'sky';

// Define interfaces for type safety
interface NavItem {
  title: string;
  url: string;
  icon: string;
  color: TailwindColor;
  items: { title: string; url: string; description: string }[];
}

interface Metric {
  title: string;
  value: string;
  icon: string;
  change: string;
  color: TailwindColor;
}

// Navigation items to match the sidebar structure
const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "#",
    icon: "lucide:layout-dashboard",
    color: "blue",
    items: [
      { title: "Overview", url: "/", description: "View your system at a glance" },
      { title: "Analytics", url: "/analytics", description: "Analyze your compliance metrics" },
      { title: "Reports", url: "#", description: "Generate detailed reports" },
    ],
  },
  {
    title: "Policies",
    url: "#",
    icon: "lucide:file-lock",
    color: "amber",
    items: [
      { title: "All Policies", url: "#", description: "Manage your compliance policies" },
      { title: "Create Policy", url: "#", description: "Define new compliance rules" },
      { title: "Templates", url: "#", description: "Use pre-built policy templates" },
    ],
  },
  {
    title: "Monitoring",
    url: "#",
    icon: "lucide:activity",
    color: "green",
    items: [
      { title: "AI Responses", url: "#", description: "Review AI model outputs" },
      { title: "Compliance Logs", url: "#", description: "Audit compliance activity" },
      { title: "Violations", url: "#", description: "Address policy violations" },
      { title: "Alerts", url: "#", description: "Manage notification settings" },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: "lucide:book-open",
    color: "indigo",
    items: [
      { title: "Getting Started", url: "#", description: "Learn platform basics" },
      { title: "SDK Integration", url: "#", description: "Implement compliance in your code" },
      { title: "Policy Writing", url: "#", description: "Best practices for policies" },
      { title: "Compliance Frameworks", url: "#", description: "Industry standard frameworks" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: "lucide:settings-2",
    color: "zinc",
    items: [
      { title: "General", url: "/settings/general", description: "Basic configuration" },
      { title: "Team", url: "/settings/team", description: "Manage team members" },
      { title: "Billing", url: "/settings/billing", description: "Subscription settings" },
      { title: "API Keys", url: "/settings/api-keys", description: "Manage API access" },
    ],
  },
];

// Sample metrics for the dashboard
const metrics: Metric[] = [
  { title: "Total Policies", value: "24", icon: "lucide:shield", change: "+12%", color: "blue" },
  { title: "Policy Violations", value: "7", icon: "lucide:alert-triangle", change: "-3%", color: "red" },
  { title: "AI Requests", value: "1,245", icon: "lucide:message-square", change: "+28%", color: "emerald" },
  { title: "Compliance Score", value: "94%", icon: "lucide:check-circle", change: "+5%", color: "sky" },
];

// Color configuration helpers
const getSectionIconClasses = (color: TailwindColor) => {
  const baseClasses = 'flex items-center justify-center rounded-lg p-2.5 transition-colors duration-300';

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    green: 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    zinc: 'bg-zinc-100 dark:bg-zinc-950/40 text-zinc-600 dark:text-zinc-400',
    red: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    sky: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
  };

  return `${baseClasses} ${colorClasses[color] || colorClasses.blue}`;
};

const getMetricChangeClasses = (color: TailwindColor) => {
  const baseClasses = 'text-xs font-medium';

  const colorClasses = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    emerald: 'text-emerald-600',
    sky: 'text-sky-600',
    amber: 'text-amber-600',
    green: 'text-green-600',
    indigo: 'text-indigo-600',
    zinc: 'text-zinc-600'
  };

  return `${baseClasses} ${colorClasses[color] || colorClasses.blue}`;
};
</script>

<template>
  <div class="col-span-3 grid gap-6">
    <CommonPageTitle title="Dashboard" description="Welcome to your AI Compliance Hub" />

    <!-- Metrics Overview -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div v-for="metric in metrics" :key="metric.title"
        class="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
        <div class="space-y-1 flex flex-col justify-between">
          <p class="text-sm font-medium text-muted-foreground">{{ metric.title }}</p>
          <div class="flex items-center gap-1">
            <p class="text-2xl font-bold">{{ metric.value }}</p>
            <span :class="getMetricChangeClasses(metric.color)">{{ metric.change }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Links Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="section in navItems" :key="section.title" class="group overflow-hidden rounded-xl border bg-card shadow-sm 
                 transition-all duration-300 hover:shadow-md hover:border-foreground/10">
        <!-- Card Header -->
        <div class="p-5 border-b border-border/40">
          <div class="flex items-center gap-3">
            <div :class="getSectionIconClasses(section.color)">
              <Icon :name="section.icon" class="size-5" aria-hidden="true" />
            </div>
            <h2 class="text-xl font-semibold text-foreground">{{ section.title }}</h2>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-2 divide-y divide-border/30">
          <NuxtLink v-for="item in section.items" :key="item.title" :to="item.url" class="block p-3 rounded-lg hover:bg-accent hover:text-accent-foreground
                       transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-ring focus-visible:ring-offset-2">
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ item.title }}</span>
              <Icon name="lucide:arrow-right"
                class="size-3.5 ml-auto opacity-0 group-hover:opacity-70 transition-opacity" aria-hidden="true" />
            </div>
            <p class="mt-1 text-sm text-muted-foreground line-clamp-1">
              {{ item.description }}
            </p>
          </NuxtLink>
        </div>

        <!-- Card Footer -->
        <div class="absolute inset-0 border-2 border-transparent opacity-0 rounded-xl 
                  pointer-events-none transition-opacity duration-300 
                  group-hover:opacity-100 group-hover:border-primary/10" />
      </div>
    </div>
  </div>
</template>

<style>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>