<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

const props = defineProps<{
  chartData: any
  chartOptions: any
}>()
</script>

<template>
  <div class="rounded-xl border bg-card p-5 shadow-sm w-full">
    <h3 class="text-md font-medium mb-3">Scores</h3>
    <p class="text-sm text-muted-foreground mb-2">Moving average per score</p>
    <div class="h-64">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
