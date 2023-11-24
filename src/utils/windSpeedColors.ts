import { STATION } from '@/station';

/**
 * Converts given `speed` to an HSL color in hue range from 0 (red) to 160 (limegreen)
 *
 * https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl
 */
export const getWindSpeedColor = (speed: number): string => {
    if (speed <= STATION.FLYABLE_WIND_SPEEDS.MIN) {
        return '#68c9e5';
    }
    if (speed >= STATION.FLYABLE_WIND_SPEEDS.MAX) {
        return 'rgb(255, 0, 0)';
    }
    const relativeSpeed =
        (speed - STATION.FLYABLE_WIND_SPEEDS.MIN) /
        (STATION.FLYABLE_WIND_SPEEDS.MAX - STATION.FLYABLE_WIND_SPEEDS.MIN);
    const hueDegrees = (1 - relativeSpeed) * 160;
    return `hsl(${hueDegrees}deg, 90%, 45%)`;
};
