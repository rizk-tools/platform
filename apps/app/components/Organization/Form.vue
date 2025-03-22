<template>
  <div>
    <h2 class="text-xl font-semibold mb-5">Create your organization</h2>
    <form class="space-y-5" @submit.prevent="createOrganization">
      <div>
        <UiLabel for="org-name">Organization Name</UiLabel>
        <UiInput id="org-name" v-model="form.name" placeholder="Acme Inc." :error="errors.name" class="w-full mt-1"
          required />
        <span v-if="errors.name" class="text-red-500 text-sm mt-1 block">{{ errors.name }}</span>
      </div>

      <div>
        <UiLabel for="org-slug">Organization Slug</UiLabel>
        <UiInput id="org-slug" v-model="form.slug" placeholder="acme" :error="errors.slug" class="w-full mt-1" required>
          <template #prefix>
            <span class="text-gray-500">rizk.tools/</span>
          </template>
        </UiInput>
        <span v-if="errors.slug" class="text-red-500 text-sm mt-1 block">{{ errors.slug }}</span>
        <p class="mt-1 text-sm text-gray-500">This will be used in URLs and cannot be changed later.</p>
      </div>

      <div class="mt-6">
        <UiButton type="submit" :loading="isLoading" :disabled="isLoading" class="w-full">
          Continue
        </UiButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { auth } from '@/lib/auth';

const emit = defineEmits(['next-step']);

const form = ref({
  name: '',
  slug: ''
});

const errors = ref({
  name: '',
  slug: ''
});

const isLoading = ref(false);

const validateForm = () => {
  errors.value = {
    name: '',
    slug: ''
  };

  let valid = true;

  if (!form.value.name.trim()) {
    errors.value.name = 'Organization name is required';
    valid = false;
  }

  if (!form.value.slug.trim()) {
    errors.value.slug = 'Organization slug is required';
    valid = false;
  } else if (!/^[a-z0-9-]+$/.test(form.value.slug)) {
    errors.value.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    valid = false;
  }

  return valid;
};

const createOrganization = async () => {
  if (!validateForm()) return;

  isLoading.value = true;

  try {
    await auth.organization.create({
      name: form.value.name,
      slug: form.value.slug
    });

    emit('next-step');
  } catch (error) {
    console.error('Error creating organization:', error);

    if (error.message.includes('slug')) {
      errors.value.slug = 'This slug is already taken';
    } else if (error.message.includes('name')) {
      errors.value.name = 'This organization name is already taken';
    } else {
      // Use toast or other notification system if available
      alert('Failed to create organization. Please try again.');
    }
  } finally {
    isLoading.value = false;
  }
};
</script>