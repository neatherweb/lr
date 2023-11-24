<script setup lang="ts">
import { useUnitStore } from '../stores/unitStore';

const unitStore = useUnitStore();
</script>

<template>
    <select v-model="unitStore.unit" class="units">
        <option :value="'kt'">kt</option>
        <option :value="'kmh'">kmh</option>
        <!-- TODO (with chart labels): <option :value="'m/s'">m/s</option> -->
    </select>
</template>

<style scoped>
.units {
    position: absolute;
    top: 0;
    right: 0;
}
</style>
