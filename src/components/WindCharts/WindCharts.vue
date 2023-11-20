<script setup lang="ts">
import type { StationData } from '@/App.vue';
import { useDocumentVisible } from '@/utils/useDocumentVisible';
import { useElementWidth } from '@/utils/useElementWidth';
import { onUnmounted, ref, watch } from 'vue';
import {
    CHART_HEIGHT,
    RELATIVE_FLYABLE_WIND_DIRECTION_RANGE_Y,
    RELATIVE_HEIGHT_OF_FLYABLE_WIND_DIRECTION_RANGE,
} from './Labels/yLabels';
import XAxis from './XAxis.vue';
import YAxis from './YAxis.vue';
import { getChartsData, type ChartsData } from './chartsData';

const props = defineProps<{
    stationData: StationData[];
}>();

const CHART_REFRESH_INTERVAL = 3000; // ms

const windSpeedWrapperRef = ref<HTMLDivElement>();
const chartWidth = useElementWidth(windSpeedWrapperRef);
const chartsData = ref<ChartsData | undefined>();
const isDocumentVisible = useDocumentVisible();

let intervalId: number | undefined = undefined;
watch(
    [isDocumentVisible, chartWidth],
    ([isDocumentVisible, chartWidth]) => {
        if (intervalId !== undefined) {
            clearInterval(intervalId);
        }
        // Repaint charts only if current browser tab is active.
        // This results in saving battery for mobile devices.
        if (isDocumentVisible && chartWidth > 0) {
            chartsData.value = getChartsData(props.stationData, chartWidth);
            intervalId = setInterval(() => {
                chartsData.value = getChartsData(props.stationData, chartWidth);
            }, CHART_REFRESH_INTERVAL);
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
    <div class="speedChart">
        <div class="title-kmh">km/h</div>
        <div class="title-kt">kt</div>
        <div ref="windSpeedWrapperRef" class="chart">
            <svg
                v-if="chartsData && chartsData.windSpeedXYPoints.length > 0"
                width="100%"
                :height="CHART_HEIGHT"
            >
                <polyline
                    key="gust"
                    fill="none"
                    stroke="#9aed8b"
                    stroke-width="3"
                    :points="`0,${chartsData.gustSpeedXYPoints.substring(
                        chartsData.gustSpeedXYPoints.indexOf(',') + 1,
                        chartsData.gustSpeedXYPoints.indexOf(' ')
                    )} ${chartsData.gustSpeedXYPoints}`"
                />
                <polygon
                    key="wind"
                    fill="#2fa2b7"
                    fill-opacity="0.2"
                    stroke="none"
                    :points="`0,${CHART_HEIGHT} 0,${chartsData.windSpeedXYPoints.substring(
                        chartsData.windSpeedXYPoints.indexOf(',') + 1,
                        chartsData.windSpeedXYPoints.indexOf(' ')
                    )} ${
                        chartsData.windSpeedXYPoints
                    } ${chartsData.windSpeedXYPoints.substring(
                        chartsData.windSpeedXYPoints.lastIndexOf(' '),
                        chartsData.windSpeedXYPoints.lastIndexOf(',')
                    )},${CHART_HEIGHT}`"
                />
                <polyline
                    fill="none"
                    stroke="#2fa2b7"
                    stroke-width="3"
                    :points="`0, ${chartsData.windSpeedXYPoints.substring(
                        chartsData.windSpeedXYPoints.indexOf(',') + 1,
                        chartsData.windSpeedXYPoints.indexOf(' ')
                    )} ${chartsData.windSpeedXYPoints}`"
                />
            </svg>
        </div>
        <template v-if="chartsData !== undefined">
            <XAxis :xLabels="chartsData.timeLabels" />
            <YAxis :yLabels="chartsData.kmhLabels" className="kmhaxis" />
            <YAxis :yLabels="chartsData.ktLabels" className="ktaxis" />
        </template>
    </div>
    <div
        v-if="chartsData && chartsData.windSpeedXYPoints.length > 0"
        class="directionChart"
    >
        <div class="chart">
            <svg width="100%" :height="CHART_HEIGHT">
                <rect
                    width="100%"
                    :height="
                        RELATIVE_HEIGHT_OF_FLYABLE_WIND_DIRECTION_RANGE + '%'
                    "
                    :y="RELATIVE_FLYABLE_WIND_DIRECTION_RANGE_Y + '%'"
                    fill="rgba(155, 237, 140, 0.5)"
                />

                <circle
                    v-for="point in chartsData.windDirectionXYPoints"
                    :cx="`${point[0]}px`"
                    :cy="`${point[1]}%`"
                    r="4"
                    fill="#2fa2b7"
                />
            </svg>
        </div>
        <YAxis :yLabels="chartsData.directionLabels" className="diraxis" />
    </div>
</template>

<style scoped>
.speedChart {
    display: grid;
    grid-template-columns: auto 1.7em 1.7em;
    grid-template-rows: min-content 200px 1.5em;
    grid-template-areas:
        'a      title-kmh  title-kt'
        'chart  kmh        knots'
        'time   b          b';
}

.chart {
    grid-area: chart;
}

.speedChart .title-kmh,
.speedChart .title-kt {
    padding: 0 0 0.3em 0;
    font-size: 0.6em;
    color: #696969;
    text-align: center;
}

.speedChart .title-kmh {
    grid-area: title-kmh;
}

.speedChart .title-kt {
    grid-area: title-kt;
}

.directionChart {
    display: grid;
    grid-template-columns: auto 3.3em;
    grid-template-rows: 200px;
    grid-template-areas: 'chart diraxis';
}

.directionChart .chart {
    background: rgb(243, 243, 243);
}
</style>
