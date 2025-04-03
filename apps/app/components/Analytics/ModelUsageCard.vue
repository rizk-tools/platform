<script setup lang="ts">
import type { PropType } from 'vue'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

// Registramos componentes necesarios de Chart.js para línea
ChartJS.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

// Props para este componente
// - totalCost: costo total (p.ej. 0.43461)
// - totalTokens: total de tokens (opcional, según tu diseño)
// - usageChartData: data del gráfico (Chart.js)
// - usageChartOptions: opciones del gráfico (Chart.js)
const props = defineProps<{
    totalCost: number,
    totalTokens: number,
    usageChartData: any,
    usageChartOptions: any
}>()
</script>

<template>
    <div>
        <!-- Cabecera: Título a la izquierda, cost/tokens a la derecha -->
        <div class="flex items-start justify-between mb-4">
            <h2 class="text-lg font-medium">Model Usage</h2>
            <div class="text-right">
                <!-- Costo total -->
                <div class="text-xl font-bold leading-tight">
                    ${{ totalCost.toFixed(3) }}
                </div>
                <div class="text-sm text-muted-foreground">
                    Token cost
                </div>
                <!-- Si deseas mostrar totalTokens también, descomenta:
        <div class="text-sm mt-1">
          {{ totalTokens.toLocaleString() }} tokens
        </div>
        -->
            </div>
        </div>

        <!-- Gráfico de línea con múltiples modelos, por ejemplo -->
        <div class="h-48">
            <Line :data="usageChartData" :options="usageChartOptions" />
        </div>
    </div>
</template>