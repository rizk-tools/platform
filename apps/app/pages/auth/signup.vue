<script lang="ts" setup>
import { z } from "zod";
import { auth } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";

// const router = useRouter()

const title = "Sign Up";
const description = "Create an account to get started.";

useSeoMeta({ title, description });

const isSubmitting = ref(false)
const authStore = useAuthStore();

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      name: z
        .string({
          required_error: "Name is required",
        })
        .min(4, "Name must be at least 4 characters"),
      email: z
        .string({
          required_error: "Email is required",
        })
        .email("Email must be a valid email"),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
    })
  ),
});

const submit = handleSubmit(async (values) => {
  if (isSubmitting.value) {
    return
  }

  try {
    isSubmitting.value = true;

    // First reset auth store to clear any previous state
    authStore.reset();

    const response = await auth.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name
    })

    if (response.error) {
      throw new Error(response.error.message)
    }

    useSonner("Account created!", {
      description: "You have successfully created an account.",
    });

    // Navigate to onboarding
    navigateTo('/onboarding', { external: true });
  } catch (error) {
    console.error(error)

    useSonner("Error creating account", {
      description: error instanceof Error ? error.message : "Please try again.",
    });
  } finally {
    isSubmitting.value = false;
  }
});

const signInWithGoogle = async () => {

};
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <div class="w-full md:w-1/2">
      <div class="mx-auto w-full max-w-[330px] px-5">
        <h1 class="text-2xl font-bold tracking-tight lg:text-3xl">{{ title }}</h1>
        <p class="mt-1 text-muted-foreground">{{ description }}</p>

        <form class="mt-10" @submit="submit">
          <fieldset :disabled="isSubmitting" class="grid gap-5">
            <UiVeeInput required label="Name" name="name" placeholder="John Doe" />
            <UiVeeInput required label="Email" type="email" name="email" placeholder="john@example.com" />
            <UiVeeInput required label="Password" type="password" name="password" />
            <UiButton class="w-full" type="submit" text="Get Started" />
            <UiDivider label="OR" />
            <UiButton variant="outline" type="button" @click="signInWithGoogle()">
              <Icon class="size-4" name="logos:google-icon" />
              <span class="ml-2">Sign up with Google</span>
            </UiButton>
          </fieldset>
        </form>
        <p class="mt-8 text-sm text-muted-foreground">
          Already have an account?
          <NuxtLink class="font-semibold text-primary underline-offset-2 hover:underline" to="/auth/login">Log in
          </NuxtLink>
        </p>
      </div>
    </div>
    <div class="hidden h-screen md:block md:w-1/2 lg:w-1/2">
      <!-- eslint-disable-next-line vue/html-self-closing -->
      <img
        src="https://images.unsplash.com/photo-1512551980832-13df02babc9e?q=60&w=2864&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Login form image" class="size-full object-cover" />
    </div>
  </div>
</template>