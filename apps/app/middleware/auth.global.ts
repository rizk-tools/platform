import { useAuthStore } from '@/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();

  // If auth is still loading, don't redirect
  if (auth.isLoading) {
    return;
  }

  const authPaths = [
    '/settings'
  ];

  const authExcludedPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];

  // If path requires authentication and user is not authenticated
  if (authPaths.some(path => to.path.startsWith(path)) && !auth.isAuthenticated) {
    return navigateTo('/auth/login');
  }

  // If user is authenticated and tries to access auth pages, redirect to home
  if (authExcludedPaths.some(path => to.path.startsWith(path)) && auth.isAuthenticated) {
    return navigateTo('/');
  }

  // Avoid redirect loop by checking if the current path is not already '/onboarding'
  if (!auth.hasOrganizations && to.path !== '/onboarding') {
    return navigateTo('/onboarding');
  }

  if (auth.hasOrganizations && to.path === '/onboarding') {
    return navigateTo('/');
  }

  // Continue to the requested page
  return;
});