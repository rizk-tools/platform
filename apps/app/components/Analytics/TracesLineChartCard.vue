<!--
  Ejemplo de un componente "TracesLineChartCard.vue"
  que replica el estilo de la segunda imagen:
  - Línea con un pico pronunciado.
  - Área de relleno.
  - Fechas en el eje X.
  - Tooltip mostrando la fecha y valor de "Traces".
-->

<script setup lang="ts">
import { Line } from "vue-chartjs"
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
} from "chart.js"

// Registramos los componentes necesarios de Chart.js
ChartJS.register(
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
)

/**
 * Props:
 *  - totalTraces: número total (ej: 2260)
 *  - chartData: data para Chart.js (debe incluir un pico marcado)
 *  - chartOptions: opciones para Chart.js (layout, ejes, tooltips, etc.)
 */
const props = defineProps<{
    totalTraces: number
    chartData: any
    chartOptions: any
}>()
</script>

<template>
    <div>
        <!-- Cabecera: título a la izquierda, estadística grande a la derecha -->
        <div class="flex items-start justify-between mb-4">
            <h2 class="text-lg font-medium">Traces</h2>
            <div class="text-right">
                <div class="text-2xl font-bold leading-tight">
                    {{ totalTraces.toLocaleString() }}
                </div>
                <div class="text-sm text-muted-foreground">
                    Traces tracked
                </div>
            </div>
        </div>

        <!-- Gráfico de línea con altura suficiente -->
        <div class="h-56">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>
