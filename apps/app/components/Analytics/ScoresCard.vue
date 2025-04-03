<!-- components/Analytics/ScoresCard.vue -->
<script setup lang="ts">
const props = defineProps<{
    totalScores: number
    scoresData: Array<{ name: string; count: number; avg: number }>
}>()
</script>

<template>
    <div>
        <!-- Cabecera con título a la izquierda y número grande a la derecha -->
        <div class="flex items-start justify-between mb-4">
            <h2 class="text-lg font-medium">Scores</h2>
            <div class="text-right">
                <!-- Número grande de la estadística -->
                <div class="text-2xl font-bold leading-tight">
                    {{ totalScores.toLocaleString() }}
                </div>
                <!-- Etiqueta secundaria -->
                <div class="text-sm text-muted-foreground">
                    total scores tracked
                </div>
            </div>
        </div>

        <!-- Tabla de scores -->
        <table class="w-full text-sm">
            <thead class="border-b text-muted-foreground">
                <tr>
                    <th class="py-2 text-left">Name</th>
                    <th class="py-2 text-left">#</th>
                    <th class="py-2 text-left">Avg</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, idx) in scoresData" :key="idx" class="border-b last:border-b-0">
                    <td class="py-2">{{ row.name }}</td>
                    <td class="py-2">{{ row.count.toLocaleString() }}</td>
                    <td class="py-2">{{ row.avg.toFixed(2) }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Botón "Show all" -->
        <div>
            <button class="mt-2 text-sm text-blue-500 hover:underline">
                ➜ Show all
            </button>
        </div>
    </div>
</template>
