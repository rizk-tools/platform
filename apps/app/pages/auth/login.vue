<script lang="ts" setup>
import { z } from "zod";
import { auth } from "@/lib/auth";

const router = useRouter()

useSeoMeta({
  title: "Log in",
  description: "Enter your email & password to log in or continue with Google or Facebook.",
});

const isSubmitting = ref(false)

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      email: z
        .string({
          required_error: "Email is required",
        })
        .email("Email must be a valid email"),
      password: z
        .string({
          required_error: "Password is required",
        })
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

    const response = await auth.signIn.email({
      email: values.email,
      password: values.password
    })

    if (response.error) {
      throw new Error(response.error.message)
    }

    useSonner("Logged in successfully!", {
      description: "You have successfully logged in.",
    });

    // Navigate to the home page after successful login
    router.push('/')
  } catch (error) {
    console.error(error)

    useSonner("Login failed", {
      description: error instanceof Error ? error.message : "Please check your credentials and try again.",
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
        <h1 class="text-2xl font-bold tracking-tight lg:text-3xl">Log in</h1>
        <p class="mt-1 text-muted-foreground">Enter your email & password to log in.</p>

        <form class="mt-10" @submit="submit">
          <fieldset :disabled="isSubmitting" class="grid gap-5">
            <UiVeeInput required label="Email" type="email" name="email" placeholder="john@example.com" />
            <UiVeeInput required label="Password" type="password" name="password" />
            <UiButton class="w-full" type="submit" text="Log in" />
            <UiDivider label="OR" />
            <UiButton variant="outline" type="button" @click="signInWithGoogle()">
              <Icon class="size-4" name="logos:google-icon" />
              <span class="ml-2">Continue with Google</span>
            </UiButton>
          </fieldset>
        </form>
        <p class="mt-8 text-sm">
          <NuxtLink class="font-semibold text-primary underline-offset-2 hover:underline" to="/auth/forgot-password">
            Forgot password?
          </NuxtLink>
        </p>
        <p class="mt-4 text-sm text-muted-foreground">
          Don't have an account?
          <NuxtLink class="font-semibold text-primary underline-offset-2 hover:underline" to="/auth/signup">Create
            account</NuxtLink>
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