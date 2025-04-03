<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  totalCost: number
  userData: Array<{ userId: string, cost: number, traces: number }>
}>()

const activeTab = ref<'cost' | 'traces'>('cost')

// Ordena la data según el tab
const sortedUsers = computed(() => {
  return [...props.userData].sort((a, b) => {
    return activeTab.value === 'cost' ? b.cost - a.cost : b.traces - a.traces
  }).slice(0, 5) // top 5 para ahora
})
</script>

<template>
  <div class="rounded-xl border bg-card p-5 shadow-sm w-full">
    <h3 class="text-md font-medium mb-3">User consumption</h3>

    <!-- Tabs -->
    <div class="flex space-x-4 border-b border-border mb-4 text-sm font-medium">
      <button @click="activeTab = 'cost'" :class="activeTab === 'cost' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'">
        Token cost
      </button>
      <button @click="activeTab = 'traces'" :class="activeTab === 'traces' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'">
        Count of Traces
      </button>
    </div>

    <!-- Monto total -->
    <div class="text-xl font-bold mb-4">${{ totalCost.toFixed(5) }} <span class="text-sm text-muted-foreground">Total cost</span></div>

    <!-- Lista -->
    <ul class="space-y-2">
      <li v-for="user in sortedUsers" :key="user.userId" class="flex justify-between items-center">
        <span class="truncate bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono">
          {{ user.userId }}
        </span>
        <span class="text-sm tabular-nums">
          {{ activeTab === 'cost' ? `$${user.cost.toFixed(6)}` : `${user.traces.toLocaleString()} traces` }}
        </span>
      </li>
    </ul>

    <!-- Botón ver más -->
    <button class="w-full mt-4 bg-muted px-4 py-2 text-sm text-muted-foreground rounded hover:bg-muted/80 transition">
      Show top 20
    </button>
  </div>
</template>
