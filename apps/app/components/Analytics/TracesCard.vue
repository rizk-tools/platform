<!-- components/Analytics/TracesCard.vue -->
<script setup lang="ts">
import type { PropType } from 'vue'
import { Bar } from "vue-chartjs"
import {
    Chart as ChartJS,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip
} from "chart.js"

// Registramos los elementos necesarios de Chart.js
ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

interface TraceCategory {
    label: string
    value: number
}

const props = defineProps<{
    totalTraces: number
    tracesChartData: any
    tracesChartOptions: any
    tracesByCategory: TraceCategory[]
}>()
</script>

<template>
    <div>
        <!-- Cabecera con el título y la estadística más grande -->
        <div class="flex items-start justify-between mb-4">
            <h2 class="text-lg font-medium">Traces</h2>

            <!-- Sección a la derecha: número grande y etiqueta pequeña -->
            <div class="text-right">
                <!-- Estadística con tamaño grande -->
                <div class="text-2xl font-bold leading-tight">
                    {{ totalTraces.toLocaleString() }}
                </div>
                <!-- Texto de apoyo -->
                <div class="text-sm text-muted-foreground">
                    total traces tracked
                </div>
            </div>
        </div>

        <!-- Gráfico de barras horizontales -->
        <div class="h-32 mb-4">
            <Bar :data="tracesChartData" :options="tracesChartOptions" />
        </div>

        <!-- Lista de categorías -->
        <div class="space-y-1">
            <div v-for="(item, idx) in tracesByCategory" :key="idx" class="flex justify-between text-sm">
                <span>{{ item.label }}</span>
                <span class="font-medium">{{ item.value.toLocaleString() }}</span>
            </div>
        </div>
    </div>
</template>
