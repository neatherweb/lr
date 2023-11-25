<script lang="ts">
export interface StationData {
    timestamp: number;
    /** Wind speed, kmh */
    wind: number;
    /** Gust speed, kmh */
    gust: number;
    /** Wind direction, degrees */
    direction: number;
}
export const STATION_REQUEST_INTERVAL = 1000 * 10;
</script>

<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { onUnmounted, ref, watch, type Ref } from 'vue';
import Latest from './components/Latest.vue';
import WindCharts, {
    Y_AXIS_WIDTH,
} from './components/WindCharts/WindCharts.vue';
import { getChartsData } from './components/WindCharts/chartsData';
import DataManager from './data/dataManager';
import { STATION } from './station';
import { useChartsStore } from './stores/chartsStore';
import { useDocumentVisible } from './utils/useDocumentVisible';
import { useElementWidth } from './utils/useElementWidth';

/**
 * HOBO's `WebSocket` data format
 */
enum HOBO_STATION_DATA {
    TIMESTAMP = 0,
    WIND,
    GUST,
    DIRECTION,
}

const onStationDataRecieved = (
    data: number[][],
    isDocumentVisible: boolean,
    stationData: Ref<StationData[]>,
    timeout: Ref<number | undefined>,
    dm: DataManager
) => {
    console.dir(data);
    // Only set new `stationData` value when there is a new data from the server
    if (
        stationData.value.length === 0 ||
        data.length > stationData.value.length ||
        (data.length > 0 &&
            data[data.length - 1][HOBO_STATION_DATA.TIMESTAMP] >
                stationData.value[stationData.value.length - 1].timestamp)
    ) {
        stationData.value = data.map((entry: number[]) => {
            return {
                timestamp: entry[HOBO_STATION_DATA.TIMESTAMP],
                wind: entry[HOBO_STATION_DATA.WIND],
                gust: entry[HOBO_STATION_DATA.GUST],
                direction: entry[HOBO_STATION_DATA.DIRECTION],
            };
        });
    }

    if (timeout.value !== undefined) {
        clearTimeout(timeout.value);
    }
    // Request new station data only if current browser tab is active.
    // This results in saving battery for mobile devices, less data usage,
    // and less requests to the server.
    if (isDocumentVisible) {
        timeout.value = window.setTimeout(() => {
            const now = Date.now();
            // TODO: only request new data here, like:
            // dm.RequestLatestData('latest-ws', dm.Streams.WindSpeed);
            dm.RequestTSData(
                'ts-all',
                [
                    dm.Streams.WindSpeed,
                    dm.Streams.GustSpeed,
                    dm.Streams.WindDirection,
                ],
                now - chartsStore.interval,
                now
            );
        }, STATION_REQUEST_INTERVAL);
    }
};

let ws: WebSocket | undefined;
let timeout: Ref<number | undefined> = ref(undefined);

const chartsStore = useChartsStore();
let dm: DataManager;

const isDocumentVisible: Ref<boolean> = useDocumentVisible();
const stationData = ref<StationData[]>([]);

const prevChartInterval = ref<number>(chartsStore.interval);
const chartsWrapperRef = ref<HTMLDivElement>();
const chartsWrapperWidth = useElementWidth(chartsWrapperRef);
const chartsData = computed(() => {
    return chartsWrapperWidth.value > 0
        ? getChartsData(
              stationData.value,
              chartsStore.interval,
              chartsWrapperWidth.value - Y_AXIS_WIDTH
          )
        : undefined;
});

watch(
    isDocumentVisible,
    (isDocumentVisible) => {
        if (timeout.value !== undefined) {
            clearTimeout(timeout.value);
        }
        if (ws !== undefined) {
            console.log('Closing WSS connection');
            ws.close();
        }
        // Request station data only if current browser tab is active.
        // This results in saving battery for mobile devices, less data usage,
        // and less requests to the server.
        if (isDocumentVisible) {
            function ErrorHandler(event: string) {
                console.log('ErrorHandler: Received error event= ' + event);
            }
            function TSDataUpdater(data: number[][]) {
                onStationDataRecieved(
                    data,
                    isDocumentVisible,
                    stationData,
                    timeout,
                    dm
                );
            }
            function LiveDataUpdater(data: any) {
                console.dir(data);
            }
            // TODO: console.log only if debug
            console.log('Starting WSS connection');
            ws = new WebSocket(STATION.HOBO_WEBSOCKET_URL);
            dm = new DataManager(
                ws,
                TSDataUpdater,
                LiveDataUpdater,
                ErrorHandler
            );
            ws.onopen = function (event) {
                console.log(
                    'Successfully connected to the websocket server, ',
                    event
                );
                const now = Date.now();
                dm.RequestTSData(
                    'ts-all',
                    [
                        dm.Streams.WindSpeed,
                        dm.Streams.GustSpeed,
                        dm.Streams.WindDirection,
                    ],
                    now - chartsStore.interval,
                    now
                );
            };
        }
    },
    { immediate: true }
);

chartsStore.$subscribe(() => {
    // Make a new data network request only when setting langer chart interval.
    // Otherwise, we should already have all the data we need
    // from the previous network request.
    // Without BigInt those numbers are too big for JS🤣 and it doesn't work.
    if (BigInt(chartsStore.interval) > BigInt(prevChartInterval.value)) {
        if (timeout.value !== undefined) {
            clearTimeout(timeout.value);
        }
        const now = Date.now();
        dm.RequestTSData(
            'ts-all',
            [
                dm.Streams.WindSpeed,
                dm.Streams.GustSpeed,
                dm.Streams.WindDirection,
            ],
            now - chartsStore.interval,
            now
        );
    }
    prevChartInterval.value = chartsStore.interval;
});

onUnmounted(() => {
    if (timeout.value !== undefined) {
        clearTimeout(timeout.value);
    }
    if (ws !== undefined) {
        console.log('Closing WSS connection');
        ws.close();
    }
});
</script>

<template>
    <div v-if="stationData.length === 0">Loading...</div>
    <template v-else>
        <Latest :latestDataEntry="stationData[stationData.length - 1]" />
        <div ref="chartsWrapperRef">
            <WindCharts
                v-if="chartsData !== undefined"
                :chartsData="chartsData"
                :chartWidth="chartsWrapperWidth - Y_AXIS_WIDTH"
                :latestDataTimestamp="
                    stationData[stationData.length - 1].timestamp
                "
            />
        </div>
    </template>
</template>
