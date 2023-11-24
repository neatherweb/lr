<script setup lang="ts">
import type { StationData } from '@/App.vue';
import { STATION } from '@/station';
import { useDocumentVisible } from '@/utils/useDocumentVisible';
import { useElementWidth } from '@/utils/useElementWidth';
import { onUnmounted, ref, watch } from 'vue';
import { getWindSpeedColor } from '../../utils/windSpeedColors';
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
const RELATIVE_HEIGHT_OF_BORDERLINE_WIND_DIRECTION_RANGE =
    ((STATION.BORDERLINE_WIND_DIRECTIONS.MAX -
        STATION.BORDERLINE_WIND_DIRECTIONS.MIN) /
        360) *
    100;
const RELATIVE_BORDERLINE_WIND_DIRECTION_RANGE_Y =
    (100 - RELATIVE_HEIGHT_OF_BORDERLINE_WIND_DIRECTION_RANGE) / 2;

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
            intervalId = window.setInterval(() => {
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
                    stroke="#d8d8d8"
                    stroke-width="3"
                    :points="`0,${chartsData.gustSpeedXYPoints.substring(
                        chartsData.gustSpeedXYPoints.indexOf(',') + 1,
                        chartsData.gustSpeedXYPoints.indexOf(' ')
                    )} ${chartsData.gustSpeedXYPoints}`"
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
    grid-template-columns: auto 1.7em 1.7em;
    grid-template-rows: min-content 150px 1.5em;
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
    grid-template-rows: 150px;
    grid-template-areas: 'chart diraxis';
}

.directionChart .chart {
    background: rgb(243, 243, 243);
}
</style>
