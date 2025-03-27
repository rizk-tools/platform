<template>
  <UiSidebarProvider v-slot="{ isMobile, state }">
    <UiVueSonner />

    <!-- Create Project Dialog -->
    <UiDialog v-model:open="showCreateProjectDialog">
      <UiDialogContent class="sm:max-w-[425px]">
        <UiDialogHeader>
          <UiDialogTitle>Create Project</UiDialogTitle>
          <UiDialogDescription>
            Add a new project to your workspace. Projects help you organize your AI compliance policies.
          </UiDialogDescription>
        </UiDialogHeader>
        <form @submit.prevent="handleCreateProject">
          <div class="grid gap-4 py-4">
            <div class="grid gap-2">
              <UiLabel for="name" required>Name</UiLabel>
              <UiInput id="name" v-model="newProject.name" placeholder="Enter project name" required />
            </div>
            <div class="grid gap-2">
              <UiLabel for="description">Description</UiLabel>
              <UiTextarea id="description" v-model="newProject.description" placeholder="Enter project description" />
            </div>
          </div>
          <UiDialogFooter>
            <UiButton type="button" variant="outline" @click="showCreateProjectDialog = false">Cancel</UiButton>
            <UiButton type="submit" :disabled="!newProject.name">Create Project</UiButton>
          </UiDialogFooter>
        </form>
      </UiDialogContent>
    </UiDialog>

    <!-- Switch Project Confirmation Dialog -->
    <UiDialog v-model:open="showSwitchProjectDialog">
      <UiDialogContent class="sm:max-w-[425px]">
        <UiDialogHeader>
          <UiDialogTitle>Switch Project</UiDialogTitle>
          <UiDialogDescription>
            Are you sure you want to switch to a different project?
          </UiDialogDescription>
        </UiDialogHeader>
        <UiDialogFooter>
          <UiButton type="button" variant="outline" @click="showSwitchProjectDialog = false">Cancel</UiButton>
          <UiButton type="button" @click="confirmSwitchProject">Switch Project</UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

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
                    <Icon mode="svg" :name="activeTeam.logo || 'lucide:shield'" class="size-4" />
                  </div>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">
                      {{ activeTeam.name }}
                    </span>
                    <span class="truncate text-xs">{{ activeTeam.slug }}</span>
                  </div>
                  <Icon mode="svg" name="lucide:chevrons-up-down" class="ml-auto" />
                </UiSidebarMenuButton>
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" align="start"
                :side="isMobile ? 'bottom' : 'right'" :side-offset="4">
                <UiDropdownMenuLabel class="text-xs text-muted-foreground">
                  Teams
                </UiDropdownMenuLabel>
                <template v-for="(org, index) in organizations" :key="index">
                  <UiDropdownMenuItem class="cursor-pointer gap-2 p-2"
                    :class="[org.name == activeTeam.name && 'bg-muted']" @click="activeTeam = org">
                    <div v-if="org.logo" class="flex size-6 items-center justify-center rounded-sm border">
                      <Icon mode="svg" :name="org.logo" class="size-4 shrink-0" />
                    </div>
                    <div v-else class="flex size-6 items-center justify-center rounded-sm border">
                      <Icon mode="svg" name="lucide:shield" class="size-4 shrink-0" />
                    </div>
                    {{ org.name }}
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
            <UiSidebarMenuItem v-for="item in projects" :key="item.name">
              <UiSidebarMenuButton as-child
                :class="[activeProjectId === item.id && 'bg-sidebar-accent text-sidebar-accent-foreground']"
                @click="handleProjectClick(item)">
                <div class="flex items-center">
                  <Icon mode="svg" :name="item.icon" />
                  <span>{{ item.name }}</span>
                </div>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>

            <UiSidebarMenuItem>
              <UiSidebarMenuButton class="text-sidebar-foreground/70" as-child @click="showCreateProjectDialog = true">
                <div class="flex items-center">
                  <Icon mode="svg" name="lucide:plus-circle" />
                  <span>New Project</span>
                </div>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>
          </UiSidebarMenu>
        </UiSidebarGroup>

        <!-- Project Navigation -->
        <UiSidebarGroup v-if="activeProject">
          <UiSidebarGroupLabel :label="activeProject.name" />
          <UiSidebarMenu>
            <UiCollapsible v-for="(item, index) in navItems" :key="index" v-slot="{ open }" as-child
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
                    <UiAvatarImage :src="userData.avatar" :alt="userData.name" />
                    <UiAvatarFallback class="rounded-lg">{{ userData.name ? userData.name.substring(0,
                      2).toUpperCase() :
                      'U' }}</UiAvatarFallback>
                  </UiAvatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">{{ userData.name }}</span>
                    <span class="truncate text-xs">{{ userData.email }}</span>
                  </div>
                  <Icon name="lucide:chevrons-up-down" class="ml-auto size-4" />
                </UiSidebarMenuButton>
              </UiDropdownMenuTrigger>
              <UiDropdownMenuContent class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                :side="isMobile ? 'bottom' : 'right'" :side-offset="4" align="end">
                <UiDropdownMenuLabel class="p-0 font-normal">
                  <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UiAvatar class="size-8 rounded-lg">
                      <UiAvatarImage :src="userData.avatar" :alt="userData.name" />
                      <UiAvatarFallback class="rounded-lg">{{ userData.name ? userData.name.substring(0,
                        2).toUpperCase() :
                        'U' }}</UiAvatarFallback>
                    </UiAvatar>
                    <div class="grid flex-1 text-left text-sm leading-tight">
                      <span class="truncate font-semibold">{{ userData.name }}</span>
                      <span class="truncate text-xs">{{ userData.email }}</span>
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
import { useQuery } from '@pinia/colada';

const router = useRouter();
const client = useApiClient();

// Define interfaces
interface Crumb {
  label: string;
  link: string;
}

interface NavItem {
  title: string;
  url: string;
  icon: string;
  isActive?: boolean;
  items: {
    title: string;
    url: string;
  }[];
}

// Breadcrumb items from plugin
const { $breadcrumbs } = useNuxtApp();
const breadcrumbItems = ref<Crumb[]>(
  $breadcrumbs && Array.isArray($breadcrumbs) ? $breadcrumbs : [
    { label: "Compliance Rules", link: "#" },
  ]
);

// Auth and organization data
const { data: organizations } = await auth.organization.list();
const { data: session } = await auth.getSession();

const activeTeam = computed(() => {
  if (!organizations) {
    return {
      id: "1",
      name: "Acme Inc",
      logo: "lucide:shield",
      slug: "acme-inc",
    };
  }

  return organizations[0];
});

if (!session) {
  router.push('/auth/login');
  throw new Error("No session found");
}

// User data 
const userData = {
  name: session.user.name,
  email: session.user.email,
  avatar: session.user.image || "",
};

// Navigation items
const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "#",
    icon: "lucide:layout-dashboard",
    isActive: true,
    items: [
      { title: "Overview", url: "/" },
      { title: "Analytics", url: "#" },
      { title: "Reports", url: "#" },
    ],
  },
  {
    title: "Policies",
    url: "#",
    icon: "lucide:file-lock",
    items: [
      { title: "All Policies", url: "#" },
      { title: "Create Policy", url: "#" },
      { title: "Templates", url: "#" },
    ],
  },
  {
    title: "Monitoring",
    url: "#",
    icon: "lucide:activity",
    items: [
      { title: "AI Responses", url: "/monitoring/responses" },
      { title: "Compliance Logs", url: "#" },
      { title: "Violations", url: "#" },
      { title: "Alerts", url: "#" },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: "lucide:book-open",
    items: [
      { title: "Getting Started", url: "#" },
      { title: "SDK Integration", url: "#" },
      { title: "Policy Writing", url: "#" },
      { title: "Compliance Frameworks", url: "#" },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: "lucide:settings-2",
    items: [
      { title: "General", url: "/settings/general" },
      { title: "Team", url: "/settings/team" },
      { title: "Billing", url: "/settings/billing" },
      { title: "API Keys", url: "/settings/api-keys" },
    ],
  },
];

// Projects state using Pinia Colada
const activeProjectId = ref<string | null>(null);

// Load projects using Pinia Colada
const projectsQuery = useQuery({
  key: ['projects'],
  query: async () => {
    const response = await client.api.projects.$get();
    const apiProjects = await response.json();

    if (!Array.isArray(apiProjects)) {
      throw new Error("Invalid projects data");
    }

    return apiProjects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      url: "#",
      icon: "lucide:folder",
      organizationId: p.organizationId
    }));
  }
});

// Create computed properties for easier template access
const projects = computed(() => projectsQuery.data.value || []);

// Project computed from active ID
const activeProject = computed(() =>
  projects.value.find(p => p.id === activeProjectId.value) || null
);

// Dialog state
const showCreateProjectDialog = ref(false);
const showSwitchProjectDialog = ref(false);
const newProject = ref({
  name: '',
  description: '',
});
const pendingProject = ref<typeof projects.value[0] | null>(null);

// Set active project and update breadcrumbs
function setActiveProject (project: typeof projects.value[0]) {
  activeProjectId.value = project.id;

  // Update breadcrumbs to reflect current project context
  breadcrumbItems.value = [
    { label: project.name, link: project.url || "#" },
    { label: "Overview", link: "#" },
  ];
}

// Handle project click to show confirmation dialog
function handleProjectClick (project: typeof projects.value[0]) {
  // If same project, do nothing
  if (activeProjectId.value === project.id) {
    return;
  }

  // Store pending project
  pendingProject.value = project;

  // Show confirmation dialog
  showSwitchProjectDialog.value = true;
}

// Confirm project switch after user confirmation
function confirmSwitchProject () {
  if (pendingProject.value) {
    setActiveProject(pendingProject.value);
    pendingProject.value = null;
    showSwitchProjectDialog.value = false;
  }
}

async function handleCreateProject () {
  try {
    // Create project through API
    const response = await client.api.projects.$post({
      json: {
        name: newProject.value.name,
        description: newProject.value.description,
        organizationId: activeTeam.value.id,
      }
    });

    const apiProject = await response.json();

    // Type guard for error response
    if ('error' in apiProject) {
      throw new Error("Failed to create project");
    }

    // Add to local projects list
    const createdProject = {
      id: apiProject.id,
      name: newProject.value.name,
      url: "#",
      icon: "lucide:folder",
      description: newProject.value.description,
      organizationId: activeTeam.value.id
    };

    // Refresh the projects query
    projectsQuery.refresh();

    // Set the newly created project as active
    setActiveProject(createdProject);

    // Reset form and close dialog
    newProject.value = {
      name: '',
      description: '',
    };

    showCreateProjectDialog.value = false;

    useSonner.success("Project created", {
      description: `${createdProject.name} has been created successfully.`,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    useSonner.error("Failed to create project", {
      description: "There was an error creating your project. Please try again.",
    });
  }
}

async function handleSignOut () {
  try {
    await auth.signOut();
    useSonner.success("Signed out successfully", {
      description: "You have been signed out of your account.",
    });
    router.push('/auth/login');
  } catch (error) {
    console.error("Error signing out:", error);
    useSonner.error("Sign out failed", {
      description: "There was an error signing out. Please try again.",
    });
  }
}

useSeoMeta({ title: "Rizk - AI Compliance Platform" });

// Set first project as active when data is loaded
watchEffect(() => {
  if (projects.value.length > 0 && !activeProjectId.value) {
    activeProjectId.value = projects.value[0].id;
  }
});
</script>
