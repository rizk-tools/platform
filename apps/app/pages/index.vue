<script lang="ts" setup>
definePageMeta({
  layout: "app"
})

const client = useApiClient()

const response = await client.api.policies.$get()

const data = await response.json()
</script>

<template>
  <div>
    <h1>Hello World</h1>
    <pre>{{ data }}</pre>
  </div>
</template>