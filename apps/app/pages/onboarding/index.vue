<template>
  <div class="max-w-xl mx-auto py-8 px-4">
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold">Welcome to Rizk</h1>
    </div>

    <div>
      <div v-if="currentStep === 1">
        <OrganizationForm @next-step="goToStep(2)" />
      </div>
      <div v-else-if="currentStep === 2">
        <OrganizationInviteMembers @complete="completeOnboarding" />
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter();
const currentStep = ref(1);

const goToStep = (step) => {
  currentStep.value = step;
};

const completeOnboarding = () => {
  router.push('/');
};
</script>