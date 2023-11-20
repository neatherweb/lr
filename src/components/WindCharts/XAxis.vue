<script setup lang="ts">
import type { XLabels } from './Labels/xLabels';

defineProps<{
    xLabels: XLabels;
}>();
</script>

<template>
    <div class="timeaxis">
        <div
            v-for="(label, i) in xLabels.labels"
            class="xlabel"
            :style="{
                left: xLabels.x[i] + 'px',
                fontWeight: label.substring(3) === '00' ? 'bold' : 'inherit',
            }"
        >
            <div class="tick"></div>
            {{ label }}
        </div>
    </div>
</template>

<style scoped>
.timeaxis {
    grid-area: time;
    border-top: 1px solid #cecece;
    position: relative;
}

.xlabel {
    position: absolute;
    top: 0;
    font-size: 0.7em;
    line-height: 1.3em;
    color: #696969;
}

.tick {
    width: 50%;
    height: 6px;
    box-sizing: content-box;
    border-right: 1px solid #cecece;
}
</style>
