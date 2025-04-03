<template>
    <PopoverPortal>
        <PopoverContentRoot v-bind="forwarded" :align="align" :side-offset="sideOffset" :class="computedClasses">
            <slot />
        </PopoverContentRoot>
    </PopoverPortal>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { PopoverContent, PopoverPortal, useForwardPropsEmits } from "radix-vue";
import type { PopoverContentProps, PopoverContentEmits } from "radix-vue";

// Definición de props, permitiendo sobreescribir align, sideOffset y agregar clases personalizadas.
const props = defineProps<PopoverContentProps & { align?: string; sideOffset?: number; customClass?: string }>();
const emit = defineEmits<PopoverContentEmits>();
const forwarded = useForwardPropsEmits(props, emit);

// Valores por defecto
const align = props.align || "center";
const sideOffset = props.sideOffset ?? 4;

const defaultClasses =
    "z-50 w-72 rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none " +
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 " +
    "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 " +
    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 " +
    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2";

// Combina las clases por defecto con las clases personalizadas (si las hubiera).
const computedClasses = computed(() => {
    return [defaultClasses, props.customClass].filter(Boolean).join(" ");
});

// Renombramos el componente importado para usarlo en el template.
const PopoverContentRoot = PopoverContent;
</script>