import { STATION } from '@/station';
import { defineStore } from 'pinia';

export type UNIT = 'kt' | 'kmh' | 'm/s';

export const useUnitStore = defineStore('unit', {
    state: (): { unit: UNIT } => ({ unit: STATION.HOBO_DASHBOARD_UNIT }),
    persist: true,
});
