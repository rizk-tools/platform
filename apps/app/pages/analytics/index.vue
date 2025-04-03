<!-- pages/analytics.vue -->
<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { format } from "date-fns"

import TracesCard from "~/components/Analytics/TracesCard.vue"
import ModelCostsCard from "~/components/Analytics/ModelCostsCard.vue"
import ScoresCard from "~/components/Analytics/ScoresCard.vue"
import TracesLineChartCard from "~/components/Analytics/TracesLineChartCard.vue"
import ModelUsageCard from "~/components/Analytics/ModelUsageCard.vue"

definePageMeta({ layout: "app" })

// --- Filtros y DatePicker ---
const dateRange = ref({
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días después
})

function formatRange({ start, end }: { start?: Date; end?: Date }) {
    if (!start || !end) return ""
    return `${format(start, "MMM d, yy '·' HH:mm")} - ${format(end, "MMM d, yy '·' HH:mm")}`
}

const displayDateRange = computed(() => formatRange(dateRange.value))
const datepickerRef = ref<any>()
const showDatepicker = ref(false)
function toggleDatepicker() {
    showDatepicker.value = !showDatepicker.value
    datepickerRef.value?.togglePopover?.()
}
const selectedRange = ref("1 month")
watch(dateRange, (val) => {
    if (val.start && val.end) {
        showDatepicker.value = false
    }
})
function onRequestChart() {
    alert("Requesting new chart with range: " + selectedRange.value)
}

// --- Dummy data para Traces (usado en TracesCard y TracesLineChartCard) ---
const totalTraces = ref(2260)
const tracesByCategory = ref([
    { label: "QA", value: 2063 },
    { label: "Sales", value: 150 },
    { label: "Support", value: 47 }
])
const tracesChartData = ref({
    labels: tracesByCategory.value.map(item => item.label),
    datasets: [
        {
            label: "Traces",
            backgroundColor: "#3B82F6",
            data: tracesByCategory.value.map(item => item.value)
        }
    ]
})

const tracesLineData = {
    labels: [
        "10/25", "10/26", "10/27", "10/28", "10/29",
        "10/30", "10/31", "11/01", "11/02", "11/03",
        "11/04", "11/05", "11/06", "11/07", "11/08"
    ],
    datasets: [
        {
            label: "Traces",
            data: [80, 120, 90, 130, 180, 220, 100, 150, 110, 400, 450, 420, 600, 190, 140],
            borderColor: "#6366F1", // un azul-violeta
            backgroundColor: "rgba(99,102,241,0.2)", // relleno suave
            fill: true,
            tension: 0.3,    // curva suave
            pointRadius: 3,  // tamaño de los puntos
        },
    ],
};

const tracesLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },  // oculta la leyenda, si deseas
        tooltip: {
            enabled: true,
            // Puedes personalizar el tooltip aquí, por ejemplo:
            callbacks: {
                label: (context) => {
                    // context.parsed.y es el valor
                    return `Traces: ${context.parsed.y}`;
                },
            },
        },
    },
    scales: {
        x: {
            display: true,
            grid: {
                color: "rgba(255,255,255,0.05)", // lineas sutiles (modo oscuro)
            },
        },
        y: {
            beginAtZero: true,
            grid: {
                color: "rgba(255,255,255,0.05)",
            },
        },
    },
};

const tracesChartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: { tooltip: { enabled: true } },
    scales: { x: { beginAtZero: true } }
})

// --- Dummy data para Model Costs ---
const totalCost = ref(0.43461)
const modelCosts = ref([
    { model: "gpt-4o-mini", tokens: 2044, usd: 0.1856 },
    { model: "text-embedding-ada-002", tokens: 31142, usd: 0.249 }
])

// --- Dummy data para Scores ---
const totalScores = ref(22170)
const scoresData = ref([
    { name: "hallucination (eval)", count: 2300, avg: 1.05 },
    { name: "irrelevance (eval)", count: 1875, avg: 2.14 },
    { name: "conciseness (eval)", count: 890, avg: 1.33 },
    { name: "friendly (eval)", count: 560, avg: 1.80 },
    { name: "frank-yuri (eval)", count: 132, avg: 2.00 }
])

// --- Dummy data para Model Usage (gráfico de línea) ---
const totalTokens = ref(41000)
const usageChartData = ref({
    labels: ["10/28", "10/29", "10/30", "10/31", "11/01", "11/02", "11/03"],
    datasets: [
        {
            label: "gpt-4o-mini",
            data: [0.05, 0.08, 0.09, 0.12, 0.18, 0.11, 0.06],
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59,130,246,0.2)",
            fill: true,
            tension: 0.3
        },
        {
            label: "text-embedding-ada-002",
            data: [0.02, 0.03, 0.02, 0.04, 0.05, 0.07, 0.03],
            borderColor: "#14B8A6",
            backgroundColor: "rgba(20,184,166,0.2)",
            fill: true,
            tension: 0.3
        }
    ]
})
const usageChartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: true },
        tooltip: { enabled: true }
    },
    scales: {
        x: { display: true },
        y: { beginAtZero: true }
    }
})
</script>

<template>
    <div class="col-span-3 grid gap-6">
        <!-- Título principal -->
        <CommonPageTitle title="Analytics" description="Analyze your compliance metrics" />

        <!-- Barra de filtros -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
                <!-- Botón para mostrar el rango y abrir el DatePicker -->
                <button
                    class="border border-input px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-accent/10 transition-colors"
                    @click="toggleDatepicker">
                    <Icon name="lucide:calendar" class="size-4" />
                    <span class="text-sm text-foreground">{{ displayDateRange }}</span>
                </button>

                <!-- Select de rangos predefinidos -->
                <div class="relative inline-block">
                    <select v-model="selectedRange" class="
              border border-input
              px-3 py-1.5
              rounded-md
              bg-background
              text-sm
              text-foreground
              cursor-pointer
              hover:bg-accent/10
              transition-colors
              focus:outline-none
              focus:ring-0
              appearance-none
              pr-8
            ">
                        <option class="bg-background text-foreground" value="1 day">1 day</option>
                        <option class="bg-background text-foreground" value="7 days">7 days</option>
                        <option class="bg-background text-foreground" value="1 month">1 month</option>
                        <option class="bg-background text-foreground" value="3 months">3 months</option>
                    </select>
                    <Icon name="lucide:chevron-down"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-foreground pointer-events-none" />
                </div>
            </div>

            <!-- Botón para Request Chart -->
            <button class="border px-3 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                @click="onRequestChart">
                Request Chart
            </button>
        </div>

        <!-- Grid de tarjetas (3 columnas) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Tarjeta de Traces (Bar Chart) -->
            <div class="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                <TracesCard :totalTraces="totalTraces" :tracesChartData="tracesChartData"
                    :tracesChartOptions="tracesChartOptions" :tracesByCategory="tracesByCategory" />
            </div>

            <!-- Tarjeta de Model Costs (Tabla) -->
            <div class="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                <ModelCostsCard :totalCost="totalCost" :modelCosts="modelCosts" />
            </div>

            <!-- Tarjeta de Scores (Tabla) -->
            <div class="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                <ScoresCard :totalScores="totalScores" :scoresData="scoresData" />
            </div>
        </div>

        <!-- Grid de tarjetas (2 columnas) para los nuevos gráficos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Tarjeta de Traces (Line Chart) -->
            <div class="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                <TracesLineChartCard :totalTraces="totalTraces" :chartData="tracesLineData"
                    :chartOptions="tracesLineOptions" />
            </div>

            <!-- Tarjeta de Model Usage (Line Chart) -->
            <div class="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                <ModelUsageCard :totalCost="totalCost" :totalTokens="totalTokens" :usageChartData="usageChartData"
                    :usageChartOptions="usageChartOptions" />
            </div>
        </div>
    </div>
</template>
