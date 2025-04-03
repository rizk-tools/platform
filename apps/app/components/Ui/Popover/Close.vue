<template>
    <PopoverCloseRoot v-bind="forwarded">
        <slot />
    </PopoverCloseRoot>
</template>

<script lang="ts" setup>
import { PopoverClose, useForwardPropsEmits } from "radix-vue";
import type { PopoverCloseProps, PopoverCloseEmits } from "radix-vue";

const props = defineProps<PopoverCloseProps>();
const emit = defineEmits<PopoverCloseEmits>();
const forwarded = useForwardPropsEmits(props, emit);

// Renombramos el componente importado para usarlo en el template.
const PopoverCloseRoot = PopoverClose;
</script>