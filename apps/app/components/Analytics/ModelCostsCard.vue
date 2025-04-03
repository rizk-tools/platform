<!-- components/Analytics/ModelCostsCard.vue -->
<script setup lang="ts">
const props = defineProps<{
    totalCost: number
    modelCosts: Array<{ model: string; tokens: number; usd: number }>
}>()
</script>

<template>
    <div>
        <!-- Cabecera con el título a la izquierda y la estadística grande a la derecha -->
        <div class="flex items-start justify-between mb-4">
            <h2 class="text-lg font-medium">Model Costs</h2>
            <div class="text-right">
                <!-- Valor principal grande -->
                <div class="text-2xl font-bold leading-tight">
                    ${{ totalCost.toFixed(3) }}
                </div>
                <!-- Etiqueta secundaria -->
                <div class="text-sm text-muted-foreground">
                    total cost
                </div>
            </div>
        </div>

        <!-- Tabla de costos -->
        <table class="w-full text-sm">
            <thead class="border-b text-muted-foreground">
                <tr>
                    <th class="py-2 text-left">Model</th>
                    <th class="py-2 text-left">Tokens</th>
                    <th class="py-2 text-left">USD</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, idx) in modelCosts" :key="idx" class="border-b last:border-b-0">
                    <td class="py-2">{{ row.model }}</td>
                    <td class="py-2">{{ row.tokens.toLocaleString() }}</td>
                    <td class="py-2">${{ row.usd.toFixed(3) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
