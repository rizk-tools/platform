import { auth } from "@/lib/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  // Get current session
  const { data: session } = await auth.getSession();

  // Define auth pages (login, register, etc.)
  const isAuthRoute = to.path.startsWith('/auth/');
  const isOnboardingRoute = to.path === '/onboarding';

  // If on auth page and logged in, redirect to home
  if (isAuthRoute && !isOnboardingRoute && session) {
    return navigateTo('/');
  }

  // If on protected page and not logged in, redirect to login
  if (!isAuthRoute && !session) {
    return navigateTo('/auth/login');
  }

  // Exempt the onboarding route from further checks
  if (isOnboardingRoute) {
    return;
  }

  // If user is logged in on a protected route, check for organizations
  if (session && !isAuthRoute) {
    try {
      // Try to access session.session.activeOrganizationId if it exists
      // This structure is based on better-auth's session data shape
      const activeOrgId = session.session?.activeOrganizationId;

      if (!activeOrgId) {
        // No active organization, redirect to onboarding
        return navigateTo('/onboarding');
      }
    } catch (error) {
      console.error("Error checking active organization:", error);
      // On error, let the request continue (don't disrupt normal flow)
    }
  }
});