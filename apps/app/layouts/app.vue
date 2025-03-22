<template>
  <UiSidebarProvider v-slot="{ isMobile, state }">
    <UiVueSonner />


    <!-- App Sidebar -->
    <UiSidebar collapsible="icon">
      <!-- Team switcher -->
      <UiSidebarHeader>
        <UiSidebarMenu>
          <UiSidebarMenuItem>
            <UiDropdownMenu>
              <UiDropdownMenuTrigger as-child>
                <UiSidebarMenuButton size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0">
                  <div
                    class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Icon mode="svg" :name="activeTeam.logo" class="size-4" />
                  </div>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">
                      {{ activeTeam.name }}
                    </span>
                    <span class="truncate text-xs">{{ activeTeam.plan }}</span>
                  </div>
                  <Icon mode="svg" name="lucide:chevrons-up-down" class="ml-auto" />
                </UiSidebarMenuButton>
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" align="start"
                :side="isMobile ? 'bottom' : 'right'" :side-offset="4">
                <UiDropdownMenuLabel class="text-xs text-muted-foreground">
                  Teams
                </UiDropdownMenuLabel>
                <template v-for="(team, index) in data.teams" :key="index">
                  <UiDropdownMenuItem class="cursor-pointer gap-2 p-2"
                    :class="[team.name == activeTeam.name && 'bg-muted']" @click="activeTeam = team">
                    <div class="flex size-6 items-center justify-center rounded-sm border">
                      <Icon mode="svg" :name="team.logo" class="size-4 shrink-0" />
                    </div>
                    {{ team.name }}
                    <UiDropdownMenuShortcut>⌘{{ index + 1 }}</UiDropdownMenuShortcut>
                  </UiDropdownMenuItem>
                </template>
                <UiDropdownMenuSeparator />
                <UiDropdownMenuItem class="gap-2 p-2">
                  <div class="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Icon name="lucide:plus" class="size-4" />
                  </div>
                  <div class="font-medium text-muted-foreground">Add team</div>
                </UiDropdownMenuItem>
              </UiDropdownMenuContent>
            </UiDropdownMenu>
          </UiSidebarMenuItem>
        </UiSidebarMenu>

        <!-- Search form -->
        <form v-if="state != 'collapsed'">
          <UiSidebarGroup class="py-0">
            <UiSidebarGroupContent class="relative">
              <UiLabel for="search" class="sr-only"> Search </UiLabel>
              <UiSidebarInput id="search" placeholder="Search the docs..." class="pl-8" />
              <Icon name="lucide:search"
                class="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
            </UiSidebarGroupContent>
          </UiSidebarGroup>
        </form>
      </UiSidebarHeader>
      <UiSidebarContent>
        <!-- Projects -->
        <UiSidebarGroup>
          <UiSidebarGroupLabel label="Projects" />
          <UiSidebarMenu>
            <UiSidebarMenuItem v-for="item in data.projects" :key="item.name">
              <UiSidebarMenuButton as-child
                :class="[item.name === activeProject.name && 'bg-sidebar-accent text-sidebar-accent-foreground']"
                @click="setActiveProject(item)">
                <div class="flex items-center">
                  <Icon mode="svg" :name="item.icon" />
                  <span>{{ item.name }}</span>
                </div>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>

            <UiSidebarMenuItem>
              <UiSidebarMenuButton class="text-sidebar-foreground/70" as-child @click="createProject">
                <div class="flex items-center">
                  <Icon mode="svg" name="lucide:plus-circle" />
                  <span>New Project</span>
                </div>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>
          </UiSidebarMenu>
        </UiSidebarGroup>

        <!-- Project Navigation -->
        <UiSidebarGroup>
          <UiSidebarGroupLabel :label="activeProject.name" />
          <UiSidebarMenu>
            <UiCollapsible v-for="(item, index) in data.navMain" :key="index" v-slot="{ open }" as-child
              :default-open="item.isActive">
              <UiSidebarMenuItem>
                <UiCollapsibleTrigger as-child>
                  <UiSidebarMenuButton :tooltip="item.title">
                    <Icon mode="svg" :name="item.icon" />

                    <span>{{ item.title }}</span>
                    <Icon mode="svg" name="lucide:chevron-right" class="ml-auto transition-transform duration-200"
                      :class="[open && 'rotate-90']" />
                  </UiSidebarMenuButton>
                </UiCollapsibleTrigger>
                <UiCollapsibleContent>
                  <UiSidebarMenuSub>
                    <UiSidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                      <UiSidebarMenuSubButton as-child>
                        <NuxtLink :href="subItem.url">
                          <span>{{ subItem.title }}</span>
                        </NuxtLink>
                      </UiSidebarMenuSubButton>
                    </UiSidebarMenuSubItem>
                  </UiSidebarMenuSub>
                </UiCollapsibleContent>
              </UiSidebarMenuItem>
            </UiCollapsible>
          </UiSidebarMenu>
        </UiSidebarGroup>
      </UiSidebarContent>
      <UiSidebarRail />
      <!-- Footer-->
      <UiSidebarFooter>
        <UiSidebarMenu>
          <UiSidebarMenuItem>
            <UiDropdownMenu>
              <UiDropdownMenuTrigger as-child>
                <UiSidebarMenuButton size="lg"
                  class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <UiAvatar class="size-8 rounded-lg">
                    <UiAvatarImage :src="data.user.avatar" :alt="data.user.name" />
                    <UiAvatarFallback class="rounded-lg">{{ data.user.name ? data.user.name.substring(0,
                      2).toUpperCase() :
                      'U' }}</UiAvatarFallback>
                  </UiAvatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">{{ data.user.name }}</span>
                    <span class="truncate text-xs">{{ data.user.email }}</span>
                  </div>
                  <Icon name="lucide:chevrons-up-down" class="ml-auto size-4" />
                </UiSidebarMenuButton>
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                :side="isMobile ? 'bottom' : 'right'" :side-offset="4" align="end">
                <UiDropdownMenuLabel class="p-0 font-normal">
                  <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UiAvatar class="size-8 rounded-lg">
                      <UiAvatarImage :src="data.user.avatar" :alt="data.user.name" />
                      <UiAvatarFallback class="rounded-lg">{{ data.user.name ? data.user.name.substring(0,
                        2).toUpperCase() :
                        'U' }}</UiAvatarFallback>
                    </UiAvatar>
                    <div class="grid flex-1 text-left text-sm leading-tight">
                      <span class="truncate font-semibold">{{ data.user.name }}</span>
                      <span class="truncate text-xs">{{ data.user.email }}</span>
                    </div>
                  </div>
                </UiDropdownMenuLabel>
                <UiDropdownMenuSeparator />
                <UiDropdownMenuGroup>
                  <UiDropdownMenuItem icon="lucide:sparkles" title="Upgrade to Pro" />
                </UiDropdownMenuGroup>
                <UiDropdownMenuSeparator />
                <UiDropdownMenuGroup>
                  <UiDropdownMenuItem icon="lucide:badge-check" title="Account" />
                  <UiDropdownMenuItem icon="lucide:credit-card" title="Billing" />
                  <UiDropdownMenuItem icon="lucide:settings-2" title="Settings" />
                  <UiDropdownMenuItem icon="lucide:bell" title="Notifications" />
                </UiDropdownMenuGroup>
                <UiDropdownMenuSeparator />
                <UiDropdownMenuItem icon="lucide:log-out" title="Log out" @click="handleSignOut" />
              </UiDropdownMenuContent>
            </UiDropdownMenu>
          </UiSidebarMenuItem>
        </UiSidebarMenu>
      </UiSidebarFooter>
    </UiSidebar>
    <!-- Sidebar main content -->
    <UiSidebarInset>
      <!-- Navbar -->
      <UiNavbar sticky class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <UiSidebarTrigger class="-ml-1" />
        <UiSeparator orientation="vertical" class="mr-2 h-4" />
        <UiBreadcrumbs :items="breadcrumbItems" />
      </UiNavbar>
      <div class="grid auto-rows-min gap-4 p-4 md:grid-cols-3">


        <slot />


      </div>
    </UiSidebarInset>
  </UiSidebarProvider>
</template>

<script lang="ts" setup>
import { auth } from "@/lib/auth";

const router = useRouter();

// Breadcrumb items from plugin
const { $breadcrumbs } = useNuxtApp();
const breadcrumbItems = $breadcrumbs || ref([
  { label: "Compliance Rules", link: "#" },
]);

const { data: session } = await auth.getSession();

if (!session) {
  router.push('/auth/login');

  throw new Error("No session found");
}


const data = {
  user: {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image || "",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: "lucide:shield",
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: "lucide:shield-check",
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: "lucide:shield-alert",
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: "lucide:layout-dashboard",
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/",
        },
        {
          title: "Analytics",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
      ],
    },
    {
      title: "Policies",
      url: "#",
      icon: "lucide:file-lock",
      items: [
        {
          title: "All Policies",
          url: "#",
        },
        {
          title: "Create Policy",
          url: "#",
        },
        {
          title: "Templates",
          url: "#",
        },
      ],
    },
    {
      title: "Monitoring",
      url: "#",
      icon: "lucide:activity",
      items: [
        {
          title: "AI Responses",
          url: "#",
        },
        {
          title: "Compliance Logs",
          url: "#",
        },
        {
          title: "Violations",
          url: "#",
        },
        {
          title: "Alerts",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: "lucide:book-open",
      items: [
        {
          title: "Getting Started",
          url: "#",
        },
        {
          title: "SDK Integration",
          url: "#",
        },
        {
          title: "Policy Writing",
          url: "#",
        },
        {
          title: "Compliance Frameworks",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: "lucide:settings-2",
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "API Keys",
          url: "/settings/api-keys",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Customer Service AI",
      url: "#",
      icon: "lucide:message-circle",
    },
    {
      name: "HR Screening Bot",
      url: "#",
      icon: "lucide:users",
    },
    {
      name: "Financial Advisor AI",
      url: "#",
      icon: "lucide:landmark",
    },
  ],
};

const activeTeam = ref(data.teams[1]);
const activeProject = ref(data.projects[0]);

interface Project {
  name: string;
  url: string;
  icon: string;
}

// Set active project and update breadcrumbs
function setActiveProject (project: Project) {
  activeProject.value = project;
  // Update breadcrumbs to reflect current project context
  breadcrumbItems.value = [
    { label: project.name, link: project.url },
    { label: "Overview", link: "#" },
  ];
}

function createProject () {
  console.log("createProject");
}


async function handleSignOut () {
  try {
    await auth.signOut();

    useSonner.success("Signed out successfully", {
      description: "You have been signed out of your account.",
    });
    // Redirect to login page
    router.push('/auth/login');
  } catch (error) {
    console.error("Error signing out:", error);
    useSonner.error("Sign out failed", {
      description: "There was an error signing out. Please try again.",
    });
  }
};

useSeoMeta({ title: "Rizk - AI Compliance Platform" });
</script>
