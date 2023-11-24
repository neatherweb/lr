import { defineStore } from 'pinia';

export type UNIT = 'kt' | 'kmh' | 'm/s';

export const useUnitStore = defineStore('unit', {
    state: (): { unit: UNIT } => ({ unit: 'kt' }),
    persist: true,
});
