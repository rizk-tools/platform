import { ref } from 'vue';

export default defineNuxtPlugin(() => {
  const breadcrumbs = ref([
    { label: "Home", link: "/" },
  ]);

  return {
    provide: {
      breadcrumbs
    }
  };
}); 