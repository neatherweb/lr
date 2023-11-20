<script setup lang="ts">
import type { StationData } from '@/App.vue';
import { useDocumentVisible } from '@/utils/useDocumentVisible';
import { onUnmounted, ref, watch } from 'vue';
import {
    formatDateTime,
    formatToOneGuaranteedDecimalPlace,
    kmhToKnots,
} from '../utils/utils';

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
            intervalId = setInterval(() => {
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
    <div class="latest">
        <div class="title">
            Latest weather as of:
            {{ formatDateTime(latestDataEntry.timestamp) }}
            <div v-if="msSinceLatestDataEntry >= MINUTE">
                {{ Math.floor(msSinceLatestDataEntry / MINUTE) }} min ago
            </div>
        </div>
        <div class="wind">
            <div>
                <span class="unit">gust:</span>{{ ' ' }}
                <span class="value">
                    {{
                        formatToOneGuaranteedDecimalPlace(latestDataEntry.gust)
                    }} </span
                >{{ ' ' }} <span class="unit">km/h</span>{{ ' ' }}
                <span class="value">
                    {{
                        formatToOneGuaranteedDecimalPlace(
                            kmhToKnots(latestDataEntry.gust)
                        )
                    }} </span
                >{{ ' ' }}
                <span class="unit">kt</span>
            </div>
            <div>
                <span class="unit">wind:</span>{{ ' ' }}
                <span class="value">
                    {{
                        formatToOneGuaranteedDecimalPlace(latestDataEntry.wind)
                    }} </span
                >{{ ' ' }} <span class="unit">km/h</span>{{ ' ' }}
                <span class="value">
                    {{
                        formatToOneGuaranteedDecimalPlace(
                            kmhToKnots(latestDataEntry.wind)
                        )
                    }} </span
                >{{ ' ' }}
                <span class="unit">kt</span>
            </div>
        </div>
        <div class="direction">
            <svg viewBox="0 0 48 48" width="48" height="48" class="circle">
                <path
                    id="arc"
                    fill="#9aed8b"
                    stroke="none"
                    fill-rule="evenodd"
                    d="M 46.82535639108369 16.58359213500126 A 24 24 0 0 0 32.99055824198189 1.7475874903971018 L 24 24 Z M 39.21690426072246 19.05572809000084 A 16 16 0 0 0 29.99370549465459 9.165058326931401 L 24 24 Z"
                ></path>
            </svg>
            <div
                class="arrow"
                style="transform: rotate({{latestDataEntry.direction}}deg);"
            >
                ↓
            </div>
        </div>
    </div>
</template>

<style scoped>
.latest {
    display: flex;
    align-items: flex-start;
    margin: 0 0 0.8em 0;
    color: #696969;
}

.latest .title {
    flex: 1;
}

.latest .wind {
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 0.9em;
    text-align: right;
    padding: 0 0.8em 0 0;
}

.latest .value {
    font-weight: bold;
}

.latest .unit {
    font-size: 0.8rem;
}

.latest .direction {
    position: relative;
    height: 50px;
}

.latest .circle {
    box-sizing: border-box;
    border: 1px solid #cecece;
    border-radius: 50%;
}

.latest .arrow {
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
