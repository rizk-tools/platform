import { auth } from "@/lib/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  // Get current session
  const { data: session } = await auth.getSession();

  // Define auth pages (login, register, etc.)
  const isAuthRoute = to.path.startsWith('/auth/');

  // If on auth page and logged in, redirect to home
  if (isAuthRoute && session) {
    return navigateTo('/');
  }

  // If on protected page and not logged in, redirect to login
  if (!isAuthRoute && !session) {
    return navigateTo('/auth/login');
  }
});