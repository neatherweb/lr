<script lang="ts">
/**
 * Width of the `y` axis of the chart, pixels
 */
export const Y_AXIS_WIDTH = 30;
</script>

<script setup lang="ts">
import { STATION } from '@/station';
import { useDocumentVisible } from '@/utils/useDocumentVisible';
import { onUnmounted, ref, watch } from 'vue';
import { useUnitStore } from '../../stores/unitStore';
import { getWindSpeedColor } from '../../utils/windSpeedColors';
import ChartTimeRangeSelector from '../ChartTimeRangeSelector.vue';
import {
    CHART_HEIGHT,
    RELATIVE_FLYABLE_WIND_DIRECTION_RANGE_Y,
    RELATIVE_HEIGHT_OF_FLYABLE_WIND_DIRECTION_RANGE,
} from './Labels/yLabels';
import XAxis from './XAxis.vue';
import YAxis from './YAxis.vue';
import { type ChartsData } from './chartsData';
import { useChartsStore } from '@/stores/chartsStore';
import { getXLabels } from './Labels/xLabels';

const props = defineProps<{
    chartsData: ChartsData;
    chartWidth: number;
    latestDataTimestamp: number;
}>();

const RELATIVE_HEIGHT_OF_BORDERLINE_WIND_DIRECTION_RANGE =
    ((STATION.BORDERLINE_WIND_DIRECTIONS.MAX -
        STATION.BORDERLINE_WIND_DIRECTIONS.MIN) /
        360) *
    100;
const RELATIVE_BORDERLINE_WIND_DIRECTION_RANGE_Y =
    (100 - RELATIVE_HEIGHT_OF_BORDERLINE_WIND_DIRECTION_RANGE) / 2;

const isDocumentVisible = useDocumentVisible();
const unitStore = useUnitStore();
const chartsStore = useChartsStore();

const chartShift = ref(0);
const timeLabels = ref();

let intervalId: number | undefined = undefined;
const repaintCharts = (isDocumentVisible: boolean) => {
    if (intervalId !== undefined) {
        clearInterval(intervalId);
    }
    // Repaint charts only if current browser tab is active.
    // This results in saving battery for mobile devices.
    if (isDocumentVisible) {
        chartShift.value =
            ((Date.now() - props.latestDataTimestamp) / chartsStore.timeRange) *
            100;
        const now = Date.now();
        timeLabels.value = getXLabels(
            {
                start: now - chartsStore.timeRange,
                end: now,
            },
            props.chartWidth
        );

        /**
         * Determines how often to animate the charts as time passes by.
         * Ensures that the animation results in at least 1 pixel movement,
         * there is no value in the animation otherwise.
         * Falls back to 1 second if the computed value is too small.
         */
        const chartsRefreshInterval = Math.max(
            chartsStore.timeRange / props.chartWidth,
            1000
        );
        intervalId = window.setInterval(() => {
            if (chartShift.value > 100) {
                clearInterval(intervalId);
            }
            chartShift.value =
                ((Date.now() - props.latestDataTimestamp) /
                    chartsStore.timeRange) *
                100;
            const now = Date.now();
            timeLabels.value = getXLabels(
                {
                    start: now - chartsStore.timeRange,
                    end: now,
                },
                props.chartWidth
            );
        }, chartsRefreshInterval);
    }
};

watch(
    [isDocumentVisible],
    ([isDocumentVisible]) => {
        repaintCharts(isDocumentVisible);
    },
    { immediate: true }
);

chartsStore.$subscribe(() => {
    repaintCharts(isDocumentVisible.value);
});

onUnmounted(() => {
    if (intervalId !== undefined) {
        clearInterval(intervalId);
    }
});
</script>

<template>
    <div class="speedChart">
        <ChartTimeRangeSelector />
        <div class="title">{{ unitStore.unit }}</div>
        <div class="chart">
            <svg
                v-if="chartsData && chartsData.windSpeedXYPoints.length > 0"
                width="100%"
                :height="CHART_HEIGHT"
                :style="`transform: translateX(-${chartShift}%)`"
            >
                <polyline
                    key="gust"
                    fill="none"
                    stroke="#d8d8d8"
                    stroke-width="3"
                    :points="chartsData.gustSpeedXYPoints"
                />
                <polyline
                    fill="none"
                    stroke="#2fa2b7"
                    stroke-width="3"
                    :points="chartsData.windSpeedXYPoints"
                />
            </svg>
        </div>
        <template v-if="chartsData !== undefined">
            <XAxis :xLabels="timeLabels" />
            <YAxis
                v-if="unitStore.unit === 'kmh'"
                :yLabels="chartsData.kmhLabels"
            />
            <YAxis
                v-if="unitStore.unit === 'kt'"
                :yLabels="chartsData.ktLabels"
            />
        </template>
    </div>
    <div
        v-if="chartsData && chartsData.windSpeedXYPoints.length > 0"
        class="directionChart"
    >
        <div class="chart">
            <svg
                width="100%"
                :height="CHART_HEIGHT"
                :style="`overflow: visible; transform: translateX(-${chartShift}%)`"
            >
                <rect
                    width="100%"
                    :height="
                        RELATIVE_HEIGHT_OF_BORDERLINE_WIND_DIRECTION_RANGE + '%'
                    "
                    :y="RELATIVE_BORDERLINE_WIND_DIRECTION_RANGE_Y + '%'"
                    fill="rgba(255, 202, 97, 0.35)"
                />
                <rect
                    width="100%"
                    :height="
                        RELATIVE_HEIGHT_OF_FLYABLE_WIND_DIRECTION_RANGE + '%'
                    "
                    :y="RELATIVE_FLYABLE_WIND_DIRECTION_RANGE_Y + '%'"
                    fill="#c7f0bf"
                />

                <circle
                    v-for="point in chartsData.windDirections"
                    :cx="`${point[0]}px`"
                    :cy="`${point[1]}%`"
                    :fill="getWindSpeedColor(point[2])"
                    r="4"
                />
            </svg>
        </div>
        <YAxis :yLabels="chartsData.directionLabels" className="diraxis" />
    </div>
</template>

<style scoped>
.speedChart {
    display: grid;
    grid-template-columns: auto 30px;
    grid-template-rows: min-content 160px 1.5em;
    grid-template-areas:
        'a      title'
        'chart  speed'
        'time   b';
    margin: -0.3rem 0 0 0;
    position: relative;
}

.chart {
    grid-area: chart;
    overflow: hidden;
}

.speedChart .title {
    padding: 0 0 0.3em 0;
    font-size: 0.6em;
    color: #696969;
    text-align: center;
    grid-area: title;
}

.directionChart {
    display: grid;
    grid-template-columns: auto 30px;
    grid-template-rows: 160px;
    grid-template-areas: 'chart diraxis';
}

.directionChart .chart {
    background: rgb(243, 243, 243);
}
</style>
