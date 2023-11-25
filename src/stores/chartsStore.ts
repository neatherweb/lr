import { defineStore } from 'pinia';

const DEFAULT_CHART_TIME_RANGE = 1000 * 3600 * 2;

export const useChartsStore = defineStore('charts', {
    state: (): {
        /**
         * Displayed chart time range, ms
         */
        timeRange: number;
    } => ({ timeRange: DEFAULT_CHART_TIME_RANGE }),
    persist: true,
});
