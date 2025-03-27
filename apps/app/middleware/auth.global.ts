import { useAuthStore } from '@/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();

  // If auth is still loading, don't redirect
  if (auth.isLoading) {
    return;
  }

  const isAuthPage = to.path.startsWith('/auth/');

  // If not on auth page and user is not authenticated, redirect to login
  if (!isAuthPage && !auth.isAuthenticated) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  // If user is authenticated and tries to access auth pages, redirect to home
  if (isAuthPage && auth.isAuthenticated) {
    return navigateTo('/');
  }

  // Handle organization requirements for authenticated users on non-auth pages
  if (auth.isAuthenticated && !isAuthPage) {
    // If user has no organizations and not on onboarding
    if (!auth.hasOrganizations && !to.path.startsWith('/onboarding')) {
      return navigateTo('/onboarding');
    }

    // If user has organizations but tries to access onboarding
    if (auth.hasOrganizations && to.path.startsWith('/onboarding')) {
      return navigateTo('/');
    }

    // If user has organizations but needs to select one
    if (auth.hasOrganizations && auth.organizations.length > 1) {
      return navigateTo('/settings/organizations');
    } else if (auth.hasOrganizations && auth.organizations.length === 1) {
      await auth.setActiveOrganization(auth.organizations[0].id);
    }
  }

  // Continue to the requested page
  return;
});