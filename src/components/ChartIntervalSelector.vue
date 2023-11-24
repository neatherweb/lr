<script setup lang="ts">
import { useChartsStore } from '@/stores/chartsStore';

const chartsStore = useChartsStore();
</script>

<template>
    <select v-model="chartsStore.interval" class="chartIntervalSelector">
        <option :value="1000 * 3600">1 hour</option>
        <option :value="1000 * 3600 * 2">2 hours</option>
        <option :value="1000 * 3600 * 3">3 hours</option>
        <option :value="1000 * 3600 * 12">12 hours</option>
        <option :value="1000 * 3600 * 24">24 hours</option>
    </select>
</template>

<style scoped>
.chartIntervalSelector {
    position: absolute;
    top: 0;
    left: 0;
}
</style>
