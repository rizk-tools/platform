<script setup lang="ts">
import { defineProps, useAttrs } from 'vue'

const props = defineProps<{
    isLoading: boolean
    description?: string
    href?: string
}>()

const attrs = useAttrs()
</script>

<template>
    <div>
        <!-- Se renderiza el skeleton si está cargando, y se heredan las clases del padre -->
        <div v-if="isLoading" class="flex h-3/4 min-h-[9rem] w-full rounded-tremor-default" v-bind="attrs">
            <Skeleton class="h-full w-full" />
        </div>
        <!-- De lo contrario, se muestra el mensaje "No data" con las clases adicionales -->
        <div v-else
            class="flex h-3/4 min-h-[9rem] w-full rounded-tremor-default border border-dashed items-center justify-center"
            v-bind="attrs">
            <span class="text-tremor-content">No data</span>
            <slot />
            <template v-if="description">
                <DocPopup :description="description" :href="href" />
            </template>
        </div>
    </div>
</template>
