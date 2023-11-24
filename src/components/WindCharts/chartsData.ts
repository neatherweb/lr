import { type StationData } from '@/App.vue';
import { getXLabels, type XLabels } from './Labels/xLabels';
import {
    CHART_HEIGHT,
    CHART_WIND_SPEED_RANGE_KMH,
    getYDirectionLabels,
    getYLabels,
    MEDIAN_FLYABLE_WIND_DIRECTION,
    type YLabels,
} from './Labels/yLabels';

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
    const shift = 180 - MEDIAN_FLYABLE_WIND_DIRECTION;
    const relativeShift = (shift / 360) * 100;
    const shiftedWindDirection = relativeWindDirectionY + relativeShift;
    return shiftedWindDirection <= 100
        ? shiftedWindDirection
        : shiftedWindDirection - 100;
};

export interface ChartsData {
    windSpeedXYPoints: string;
    gustSpeedXYPoints: string;
    timeLabels: XLabels;
    kmhLabels: YLabels;
    ktLabels: YLabels;
    windDirections: [number, number, number][];
    directionLabels: YLabels;
}

export const getChartsData = (
    stationData: StationData[],
    chartInterval: number,
    width: number
): ChartsData => {
    let now = Date.now();
    now = now - (now % 1000);
    const chartTimeRange = {
        start: now - chartInterval,
        end: now,
    };
    const getRelativeX = getRelativeCoordinate(chartTimeRange);
    const getRelativeWindSpeedY = getRelativeCoordinate(
        CHART_WIND_SPEED_RANGE_KMH,
        true
    );
    let windSpeedXYPoints = '';
    let gustSpeedXYPoints = '';
    const windDirections: [number, number, number][] = [];

    stationData.forEach((entry) => {
        const relativeX = getRelativeX(entry.timestamp);
        const x = getChartPoint(relativeX, width);
        const relativeWindY = getRelativeWindSpeedY(entry.wind);
        const windY = getChartPoint(relativeWindY, CHART_HEIGHT);
        windSpeedXYPoints += `${x},${windY} `;
        const relativeGustY = getRelativeWindSpeedY(entry.gust);
        const gustY = getChartPoint(relativeGustY, CHART_HEIGHT);
        gustSpeedXYPoints += `${x},${gustY} `;
        const windDirectionY = getWindDirectionY(entry.direction);
        windDirections.push([x, windDirectionY, entry.wind]);
    });

    const timeLabels = getXLabels(chartTimeRange, width);
    const kmhLabels = getYLabels(true);
    const ktLabels = getYLabels(false);
    const directionLabels = getYDirectionLabels();
    return {
        windSpeedXYPoints: windSpeedXYPoints.trim(),
        gustSpeedXYPoints: gustSpeedXYPoints.trim(),
        timeLabels,
        kmhLabels,
        ktLabels,
        windDirections,
        directionLabels,
    };
};
