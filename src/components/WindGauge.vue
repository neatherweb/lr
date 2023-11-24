<script lang="ts">
function computeArcPath(
    cx: number,
    cy: number,
    radius: number,
    startBearing: number,
    endBearing: number
) {
    const mx = cx + radius * Math.sin((startBearing * Math.PI) / 180);
    const my = cy - radius * Math.cos((startBearing * Math.PI) / 180);
    const nx = cx + radius * Math.sin((endBearing * Math.PI) / 180);
    const ny = cy - radius * Math.cos((endBearing * Math.PI) / 180);
    const dx = nx - mx;
    const dy = ny - my;
    return `m ${mx},${my} a ${radius},${radius} 0 0 1 ${dx},${dy} L ${radius},${radius} z`;
}
</script>

<script setup lang="ts">
import { STATION } from '@/station';
import { useUnitStore } from '@/stores/unitStore';
import { ref } from 'vue';
import { formatToOneGuaranteedDecimalPlace, kmhToKnots } from '../utils/utils';
import { getWindSpeedColor } from '../utils/windSpeedColors';
import WindSpeedUnitSelector from './WindSpeedUnitSelector.vue';

const props = defineProps<{
    size: number;
    windSpeed: number;
    gustSpeed: number;
    windDirection: number;
}>();

const unitStore = useUnitStore();

const windSpeed = ref(0);
const gustSpeed = ref(0);

unitStore.$subscribe(
    () => {
        windSpeed.value =
            unitStore.unit === 'kmh'
                ? props.windSpeed
                : kmhToKnots(props.windSpeed);
        gustSpeed.value =
            unitStore.unit === 'kmh'
                ? props.gustSpeed
                : kmhToKnots(props.gustSpeed);
    },
    { immediate: true }
);

const outer_radius = props.size / 2;
const inner_radius = outer_radius * 0.88;
const inner_shift = `translate(${outer_radius - inner_radius},${
    outer_radius - inner_radius
})`;

const viewbox = ref(`0 0 ${props.size} ${props.size}`);

const warnzonearc = ref(
    computeArcPath(
        outer_radius,
        outer_radius,
        outer_radius,
        STATION.BORDERLINE_WIND_DIRECTIONS.MIN,
        STATION.BORDERLINE_WIND_DIRECTIONS.MAX
    )
);
const greenzonearc = ref(
    computeArcPath(
        outer_radius,
        outer_radius,
        outer_radius,
        STATION.FLYABLE_WIND_DIRECTIONS.MIN,
        STATION.FLYABLE_WIND_DIRECTIONS.MAX
    )
);
</script>

<template>
    <div class="windgauge">
        <WindSpeedUnitSelector />
        <span class="direction north">N</span>
        <span class="direction east">E</span>
        <span class="direction south">S</span>
        <span class="direction west">W</span>
        <svg
            :width="props.size"
            :height="props.size"
            :viewBox="viewbox"
            class="gauge"
        >
            <g>
                <circle
                    style="fill: transparent"
                    :r="outer_radius"
                    :cy="outer_radius"
                    :cx="outer_radius"
                />
                <path style="fill: #ffca61" :d="warnzonearc" />
                <path style="fill: #9aed8b" :d="greenzonearc" />
                <g :transform="inner_shift">
                    <circle
                        style="fill: #fff"
                        id="circle1"
                        :r="inner_radius"
                        :cy="inner_radius"
                        :cx="inner_radius"
                    />
                </g>
            </g>
        </svg>

        <div class="legend">
            <div class="gustSpeed">
                {{ formatToOneGuaranteedDecimalPlace(gustSpeed)
                }}<span class="unit">{{ unitStore.unit }}</span>
            </div>
            <div class="windSpeed">
                {{ formatToOneGuaranteedDecimalPlace(windSpeed)
                }}<span class="unit">{{ unitStore.unit }}</span>
            </div>
            <div class="windDirection">{{ props.windDirection }}°</div>
        </div>
        <div
            class="windIndicator"
            :style="{
                height: `${inner_radius * 2 - 3}px`,
                transform: `rotate(${props.windDirection}deg)`,
            }"
        >
            <svg width="24" height="24" viewBox="1.3299 1.0038 52 68.11">
                <path
                    d="M 218.45 301.246 H 252.543 L 250.054 283.746 L 286.56 309.746 L 250.054 335.746 L 252.543 318.246 H 218.45 V 301.246 Z"
                    :fill="getWindSpeedColor(props.windSpeed)"
                    transform="matrix(0, 1, -1, 0, 337.07589721679693, -217.4461669921875)"
                />
            </svg>
        </div>
        <div class="info">
            <div class="i">i</div>
            <span class="tooltiptext"
                >The outer arc shows green for flyable direction, amber for
                border-line. The direction indicator points to current wind
                direction (changing color for wind speed). Gust speed, wind
                speed and wind direction are shown in the inner gauge.</span
            >
        </div>
    </div>
</template>

<style scoped>
.windgauge {
    display: grid;
    grid-template-columns: min-content min-content min-content;
    grid-template-rows: min-content min-content min-content;
    grid-template-areas:
        'north   north   north'
        'west   gauge   east'
        'south  south   south';
    align-items: center;
    justify-content: center;
    position: relative;
}

.info {
    position: absolute;
    top: 0;
    left: 0;
}
.i {
    width: 1.5rem;
    height: 1.5rem;
    border: 1px solid #cecece;
    border-radius: 50%;
    text-align: center;
    vertical-align: middle;
    line-height: 1.3rem;
    color: #cecece;
}

.tooltiptext {
    visibility: hidden;
    width: 180px;
    background-color: rgb(81, 80, 80);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 0.4rem;

    /* Position the tooltip */
    position: absolute;
    left: 0;
    z-index: 1;
}

.info:hover .tooltiptext {
    visibility: visible;
}

.direction {
    text-align: center;
    font-size: 0.7rem;
}

.north {
    grid-area: north;
}
.east {
    grid-area: east;
}
.south {
    grid-area: south;
}
.west {
    grid-area: west;
}
.gauge {
    grid-area: gauge;
    margin: 0.1rem 0.3rem;
    border: 1px solid #cecece;
    border-radius: 50%;
}

.legend {
    grid-area: gauge;
    text-align: center;
    margin: 5px 0 0 2px;
}

.gustSpeed {
    font-size: 1.3rem;
    line-height: 1rem;
    padding: 0 0 5px 0;
}
.windSpeed {
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 1.2rem;
    padding: 0 0 3px 0;
}
.windDirection {
    font-size: 0.9rem;
    line-height: 1rem;
}
.unit {
    font-size: 0.7rem;
    padding: 0 0 0 2px;
}

.windIndicator {
    grid-area: gauge;
    text-align: center;
    vertical-align: top;
}
</style>
