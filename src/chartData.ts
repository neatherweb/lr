import { CHART_DATA_INTERVAL, StationData } from '.';
import { XLabels, getXLabels } from './xLabels';
import {
    CHART_HEIGHT,
    CHART_WIND_SPEED_RANGE_KMH,
    WIND_DIRECTION_WINDOW_CENTER,
    YLabels,
    getYDirectionLabels,
    getYLabels,
} from './yLabels';

export interface TimeRange {
    start: number;
    end: number;
}

const getRelativeCoordinate = (range: TimeRange, inverted = false) => {
    return (absoluteCoordinate: number) => {
        return inverted
            ? 1 - (absoluteCoordinate - range.start) / (range.end - range.start)
            : (absoluteCoordinate - range.start) / (range.end - range.start);
    };
};

const getChartPoint = (relativeCoordinate: number, range: number): number => {
    return Math.round(relativeCoordinate * range);
};

const getWindDirectionY = (direction: number): number => {
    const relativeWindDirectionY = (direction / 360) * 100; // %
    const shift = 180 - WIND_DIRECTION_WINDOW_CENTER;
    const relativeShift = (shift / 360) * 100;
    const shiftedWindDirection = relativeWindDirectionY + relativeShift;
    return shiftedWindDirection <= 100
        ? shiftedWindDirection
        : shiftedWindDirection - 100;
};

export const getChartData = (
    stationData: StationData[],
    width: number
): [string, string, XLabels, YLabels, YLabels, [number, number][], YLabels] => {
    const step = 1000;
    let now = Date.now();
    /**
     * To be used for testing together with `useMockStationData`
     */
    // let now = 1699064845461;
    now = now - (now % 1000);
    const chartTimeRange = {
        start: now - CHART_DATA_INTERVAL,
        end: now,
    };
    const getRelativeX = getRelativeCoordinate(chartTimeRange);
    const getRelativeWindSpeedY = getRelativeCoordinate(
        CHART_WIND_SPEED_RANGE_KMH,
        true
    );
    let windChartPoints = '';
    let gustChartPoints = '';
    const windDirectionPoints = [];
    let i = chartTimeRange.start;
    while (i <= chartTimeRange.end) {
        const entry = stationData.find((entry) => entry.timestamp === i);
        if (entry) {
            const relativeX = getRelativeX(i);
            const x = getChartPoint(relativeX, width);
            const relativeWindY = getRelativeWindSpeedY(entry.wind);
            const windY = getChartPoint(relativeWindY, CHART_HEIGHT);
            windChartPoints += `${x},${windY} `;
            const relativeGustY = getRelativeWindSpeedY(entry.gust);
            const gustY = getChartPoint(relativeGustY, CHART_HEIGHT);
            gustChartPoints += `${x},${gustY} `;
            const windDirectionY = getWindDirectionY(entry.direction);
            windDirectionPoints.push([x, windDirectionY]);
        }
        i += step;
    }
    const xLabels = getXLabels(chartTimeRange, width);
    const yLabelsKmh = getYLabels(true);
    const yLabelsKt = getYLabels(false);
    const yDirectionLabels = getYDirectionLabels();

    return [
        windChartPoints.trim(),
        gustChartPoints.trim(),
        xLabels,
        yLabelsKmh,
        yLabelsKt,
        windDirectionPoints,
        yDirectionLabels,
    ];
};
