<script setup lang="ts">
import { ref, computed } from 'vue'
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

ChartJS.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

const props = defineProps<{
    totalCost: number,
    totalTokens: number,
    usageChartData: {
        cost: any,
        tokens: any
    },
    usageChartOptions: {
        cost: any,
        tokens: any
    },
    legendPosition?: 'bottom' | 'right' | 'left' | 'top' // opcional para ubicar leyenda
}>()

const activeTab = ref<'cost' | 'tokens'>('cost')

// Configuración dinámica basada en el tab
const chartData = computed(() => props.usageChartData[activeTab.value])
const chartOptions = computed(() => {
    const options = props.usageChartOptions[activeTab.value]
    if (props.legendPosition) {
        options.plugins = options.plugins || {}
        options.plugins.legend = {
            position: props.legendPosition
        }
    }
    return options
})
</script>

<template>
    <div>
        <!-- Header -->
        <div class="mb-4">
            <h2 class="text-lg font-semibold mb-2">Model Usage</h2>

            <!-- Tabs -->
            <div class="flex items-center space-x-4 border-b border-border mb-4">
                <button class="flex items-center space-x-1 pb-1 text-sm font-medium transition-colors"
                    :class="activeTab === 'cost' ? 'border-b-2 border-green-500 text-green-500' : 'text-muted-foreground hover:text-foreground'"
                    @click="activeTab = 'cost'">
                    <span>Total cost</span>
                </button>
                <button class="flex items-center space-x-1 pb-1 text-sm font-medium transition-colors"
                    :class="activeTab === 'tokens' ? 'border-b-2 border-green-500 text-green-500' : 'text-muted-foreground hover:text-foreground'"
                    @click="activeTab = 'tokens'">
                    <span>Total tokens</span>
                </button>
            </div>

            <!-- Info dinámica con transición -->
            <transition name="fade" mode="out-in">
                <div key="info" class="text-right leading-tight">
                    <div v-if="activeTab === 'cost'" key="cost">
                        <div class="text-xl font-bold transition-all duration-300 ease-in-out">
                            ${{ totalCost.toFixed(5) }}
                        </div>
                        <div class="text-sm text-muted-foreground">Token cost</div>
                    </div>
                    <div v-else key="tokens">
                        <div class="text-xl font-bold transition-all duration-300 ease-in-out">
                            {{ totalTokens.toLocaleString() }}
                        </div>
                        <div class="text-sm text-muted-foreground">Token count</div>
                    </div>
                </div>
            </transition>
        </div>

        <!-- Gráfico dinámico según tab -->
        <div class="h-64">
            <Line :data="chartData" :options="chartOptions" />
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
