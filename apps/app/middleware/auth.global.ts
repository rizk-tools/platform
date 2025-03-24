import { auth } from "@/lib/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  const authPaths = [
    '/settings'
  ];

  const authExcludedPaths = [
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];

  // Check if the user is authenticated
  const { data: session } = await auth.getSession();
  const isAuthenticated = !!session;

  // If path requires authentication and user is not authenticated
  if (authPaths.some(path => to.path.startsWith(path)) && !isAuthenticated) {
    return navigateTo('/auth/login');
  }

  // If user is authenticated and tries to access auth pages, redirect to home
  if (authExcludedPaths.some(path => to.path.startsWith(path)) && isAuthenticated) {
    return navigateTo('/');
  }

  const organizations = await auth.organization.list()



  // Avoid redirect loop by checking if the current path is not already '/onboarding'
  if (organizations.data?.length === 0 && to.path !== '/onboarding') {
    return navigateTo('/onboarding');
  }

  if (to.path === '/onboarding' && (organizations.data?.length ?? 0) > 0) {
    return navigateTo('/');
  }

  // Continue to the requested page
  return;
});