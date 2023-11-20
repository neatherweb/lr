<script setup lang="ts">
import { STATION } from '../station';
</script>

<template>
    <header>
        <h1>{{ STATION.NAME }} weather station</h1>
        <a href="https://www.flysydney.com.au/" class="logo">
            <img
                src="../assets/SPHGC.png"
                alt="SPHGC logo"
                height="50"
                width="50"
            />
        </a>
    </header>
</template>

<style scoped>
header {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 0.5em 0;
}

h1 {
    display: block;
    font-size: 1.2em;
    font-weight: bold;
    margin: 0;
    padding: 0 1em 0 0;
}

.logo {
    display: block;
    width: 50px;
    height: 50px;
}
</style>
