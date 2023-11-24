import { defineStore } from 'pinia';

const DEFAULT_CHART_INTERVAL = 1000 * 3600 * 2;

export const useChartsStore = defineStore('charts', {
    state: (): {
        /**
         * Displayed chart time interval, ms
         */
        interval: number;
    } => ({ interval: DEFAULT_CHART_INTERVAL }),
    persist: true,
});
