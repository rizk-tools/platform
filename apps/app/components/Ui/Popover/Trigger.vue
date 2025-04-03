<template>
    <PopoverTriggerRoot v-bind="forwarded">
        <slot />
    </PopoverTriggerRoot>
</template>

<script lang="ts" setup>
import { PopoverTrigger, useForwardPropsEmits } from "radix-vue";
import type { PopoverTriggerProps, PopoverTriggerEmits } from "radix-vue";

const props = defineProps<PopoverTriggerProps>();
const emit = defineEmits<PopoverTriggerEmits>();
const forwarded = useForwardPropsEmits(props, emit);

// Se renombra el componente importado para evitar conflicto con el nombre del archivo.
const PopoverTriggerRoot = PopoverTrigger;
</script>