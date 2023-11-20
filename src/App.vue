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
export const CHART_DATA_INTERVAL = 1000 * 3600 * 2; // 2h
export const STATION_REQUEST_INTERVAL = 1000 * 10;
</script>

<script setup lang="ts">
import { ref, watch, type Ref, onUnmounted } from 'vue';
import Header from './components/Header.vue';
import Latest from './components/Latest.vue';
import WindCharts from './components/WindCharts/WindCharts.vue';
import DataManager from './data/dataManager';
import { STATION } from './station';
import { useDocumentVisible } from './utils/useDocumentVisible';

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
    timeoutId: number | undefined,
    dm: DataManager
) => {
    console.dir(data);
    stationData.value = data.map((entry: number[]) => {
        return {
            timestamp: entry[HOBO_STATION_DATA.TIMESTAMP],
            wind: entry[HOBO_STATION_DATA.WIND],
            gust: entry[HOBO_STATION_DATA.GUST],
            direction: entry[HOBO_STATION_DATA.DIRECTION],
        };
    });
    if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
    }
    // Request new station data only if current browser tab is active.
    // This results in saving battery for mobile devices, less data usage,
    // and less requests to the server.
    if (isDocumentVisible) {
        timeoutId = setTimeout(() => {
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
                now - CHART_DATA_INTERVAL,
                now
            );
        }, STATION_REQUEST_INTERVAL);
    }
};

let ws: WebSocket | undefined;
let timeoutId: number | undefined = undefined;

const isDocumentVisible: Ref<boolean> = useDocumentVisible();
const stationData = ref<StationData[]>([]);

watch(
    isDocumentVisible,
    (isDocumentVisible) => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
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
                    timeoutId,
                    dm
                );
            }
            function LiveDataUpdater(data: any) {
                console.dir(data);
            }
            // TODO: console.log only if debug
            console.log('Starting WSS connection');
            ws = new WebSocket(STATION.HOBO_WEBSOCKET_URL);
            const dm = new DataManager(
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
                    now - CHART_DATA_INTERVAL,
                    now
                );
            };
        }
    },
    { immediate: true }
);

onUnmounted(() => {
    if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
    }
    if (ws !== undefined) {
        console.log('Closing WSS connection');
        ws.close();
    }
});
</script>

<template>
    <Header />
    <main>
        <div v-if="stationData.length === 0">Loading...</div>
        <template v-else>
            <Latest :latestDataEntry="stationData[stationData.length - 1]" />
            <WindCharts :stationData="stationData" />
        </template>
    </main>
</template>
