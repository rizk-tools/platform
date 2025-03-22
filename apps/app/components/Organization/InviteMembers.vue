<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Invite team members</h2>
    <p class="text-gray-500 mb-5">
      Add team members to collaborate with you.
    </p>

    <div class="space-y-4">
      <div v-for="(invitee, index) in invitees" :key="index" class="flex gap-3">
        <div class="flex-1">
          <UiInput v-model="invitee.email" placeholder="colleague@example.com" :error="invitee.error" class="w-full" />
          <span v-if="invitee.error" class="text-red-500 text-sm mt-1 block">{{ invitee.error }}</span>
        </div>
        <div class="w-32">
          <UiSelect v-model="invitee.role">
            <UiSelectTrigger placeholder="Select an option" />
            <UiSelectContent>
              <UiSelectLabel>Roles</UiSelectLabel>
              <UiSelectSeparator />
              <UiSelectGroup>
                <UiSelectItem v-for="(role, i) in roles" :key="i" :value="role.value" :text="role.text" />
              </UiSelectGroup>
            </UiSelectContent>
          </UiSelect>
        </div>
        <UiButton v-if="index > 0" variant="ghost" class="!p-2" @click="removeInvitee(index)">
          <span class="i-heroicons-trash h-5 w-5 text-red-500" />
        </UiButton>
      </div>

      <div>
        <UiButton variant="outline" class="w-full" @click="addInvitee">
          <span class="i-heroicons-plus h-4 w-4 mr-2" />
          Add another
        </UiButton>
      </div>

      <div v-if="error" class="bg-red-50 px-3 py-2 text-red-600 text-sm mt-4">
        {{ error }}
      </div>

      <div class="border-t border-gray-100 pt-6 mt-6 flex justify-between">
        <UiButton variant="ghost" @click="skipInvitations">
          Skip for now
        </UiButton>
        <UiButton :loading="isLoading" :disabled="isLoading || !hasValidInvitees" @click="sendInvitations">
          Complete
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { auth } from '@/lib/auth';

const emit = defineEmits(['complete']);

const invitees = ref([
  { email: '', role: 'member', error: '' }
]);

const roles = ref([
  { value: 'admin', text: 'Admin' },
  { value: 'member', text: 'Member' },
  { value: 'guest', text: 'Guest' }
]);

const isLoading = ref(false);
const error = ref('');

const hasValidInvitees = computed(() => {
  return invitees.value.some(invitee => {
    return invitee.email.trim() !== '' && isValidEmail(invitee.email);
  });
});

const addInvitee = () => {
  invitees.value.push({ email: '', role: 'member', error: '' });
};

const removeInvitee = (index) => {
  invitees.value.splice(index, 1);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateInvitees = () => {
  let valid = true;

  invitees.value.forEach((invitee, index) => {
    invitee.error = '';

    if (invitee.email.trim() === '') {
      if (index === 0 || invitees.value.some(i => i.email.trim() !== '')) {
        invitee.error = 'Email is required';
        valid = false;
      }
    } else if (!isValidEmail(invitee.email)) {
      invitee.error = 'Invalid email address';
      valid = false;
    }
  });

  // Filter out empty invitees except the first one
  if (valid && invitees.value.length > 1) {
    invitees.value = invitees.value.filter((invitee, index) => {
      return index === 0 || invitee.email.trim() !== '';
    });
  }

  return valid;
};

const sendInvitations = async () => {
  if (!validateInvitees()) return;

  const validInvitees = invitees.value.filter(invitee => invitee.email.trim() !== '');

  if (validInvitees.length === 0) {
    skipInvitations();
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    const promises = validInvitees.map(invitee =>
      auth.organization.inviteMember({
        email: invitee.email,
        role: invitee.role
      })
    );

    await Promise.all(promises);
    emit('complete');
  } catch (err) {
    console.error('Error inviting members:', err);
    error.value = 'Failed to send invitations. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const skipInvitations = () => {
  emit('complete');
};
</script>