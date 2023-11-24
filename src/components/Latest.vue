<script setup lang="ts">
import type { StationData } from '@/App.vue';
import WindGauge from './WindGauge.vue';
import { useDocumentVisible } from '@/utils/useDocumentVisible';
import { onUnmounted, ref, watch } from 'vue';
import { formatDateTime } from '../utils/utils';
import { STATION } from '../station';

const props = defineProps<{
    latestDataEntry: StationData;
}>();

/** A minute in milliseconds */
const MINUTE = 60 * 1000;
/** Milliseconds passed since the latest data entry's timestamp */
const msSinceLatestDataEntry = ref<number>(0);
const isDocumentVisible = useDocumentVisible();

let intervalId: number | undefined = undefined;
watch(
    isDocumentVisible,
    (isDocumentVisible) => {
        if (intervalId !== undefined) {
            clearInterval(intervalId);
        }
        // Repaint charts only if current browser tab is active.
        // This results in saving battery for mobile devices.
        if (isDocumentVisible) {
            msSinceLatestDataEntry.value =
                Date.now() - props.latestDataEntry.timestamp;
            intervalId = window.setInterval(() => {
                {
                    msSinceLatestDataEntry.value =
                        Date.now() - props.latestDataEntry.timestamp;
                }
            }, 3000);
        }
    },
    { immediate: true }
);

onUnmounted(() => {
    if (intervalId !== undefined) {
        clearInterval(intervalId);
    }
});
</script>

<template>
    <header>
        <h1>{{ STATION.NAME }} weather station</h1>
        <div class="latest">
            <span v-if="msSinceLatestDataEntry >= MINUTE" class="latestUpdate">
                {{ Math.floor(msSinceLatestDataEntry / MINUTE) }} min ago,</span
            >
            at {{ formatDateTime(latestDataEntry.timestamp) }}:
        </div>
        <a href="https://www.flysydney.com.au/" class="logo">
            <img
                src="../assets/SPHGC.png"
                alt="SPHGC logo"
                height="50"
                width="50"
            />
        </a>
    </header>
    <WindGauge
        :size="160"
        :windSpeed="latestDataEntry.wind"
        :gustSpeed="latestDataEntry.gust"
        :windDirection="latestDataEntry.direction"
    ></WindGauge>
</template>

<style scoped>
header {
    display: grid;
    margin: 0 0 0.6em 0;
    grid-template-areas:
        'title logo'
        'latest logo';
    grid-template-columns: auto min-content;
    align-items: center;
}

h1 {
    grid-area: title;
    font-size: 1.2em;
    font-weight: bold;
    margin: 0;
}

.logo {
    grid-area: logo;
    display: block;
    width: 50px;
    height: 50px;
}

.latest {
    grid-area: latest;
    color: #696969;
    font-size: 0.9rem;
}

.latestUpdate {
    font-weight: bold;
}

.value {
    font-weight: bold;
}

.unit {
    font-size: 0.8rem;
}

.direction {
    position: relative;
    width: 50px;
    height: 50px;
}

.circle {
    box-sizing: border-box;
    border: 1px solid #cecece;
    border-radius: 50%;
}

.arrow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    text-align: center;
    line-height: 50px;
    font-size: 1.8em;
    color: #696969;
}
</style>
