<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold tracking-tight">{{ title }}</h2>
    <p class="text-muted-foreground">{{ description }}</p>
  </div>
</template>