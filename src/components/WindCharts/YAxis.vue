<script setup lang="ts">
import type { YLabels } from './Labels/yLabels';

defineProps<{
    yLabels: YLabels;
}>();
</script>

<template>
    <div>
        <div
            v-for="(label, i) in yLabels.labels"
            class="ylabel"
            :style="{
                top: yLabels.y[i] + 'px',
            }"
        >
            <div class="tick"></div>
            {{ label }}
        </div>
    </div>
</template>

<style>
.kmhaxis {
    grid-area: kmh;
    height: 100%;
    border-left: 1px solid #cecece;
    position: relative;
}

.ylabel {
    position: absolute;
    left: 0;
    font-size: 0.7em;
    line-height: 1.3em;
    color: #696969;
    vertical-align: bottom;
    margin: -0.6em 0 0 0;
}

.kmhaxis .ylabel,
.ktaxis .ylabel {
    margin: -2.1em 0 0 0;
}

.ylabel .tick {
    display: inline-block;
    width: 6px;
    height: 0.3em;
    border-top: 1px solid #cecece;
    margin: 0 1px 0 0;
}

.ktaxis {
    grid-area: knots;
    height: 100%;
    position: relative;
}

.diraxis {
    grid-area: diraxis;
    height: 100%;
    position: relative;
}
</style>
