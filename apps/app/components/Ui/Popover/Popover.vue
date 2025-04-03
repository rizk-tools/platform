<template>
    <PopoverRoot v-bind="forwarded">
        <slot />
    </PopoverRoot>
</template>

<script lang="ts" setup>
import { PopoverRoot, useForwardPropsEmits } from "radix-vue";
import type { PopoverRootProps, PopoverRootEmits } from "radix-vue";

const props = defineProps<PopoverRootProps>();
const emit = defineEmits<PopoverRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);
</script>