import { getLabelsInterval } from './utils';

const Y_AXIS_INTERVALS: number[] = [10, 5, 1];
const MIN_Y_LABELS_COUNT = 1;
const MAX_Y_LABELS_COUNT = 10;
const Y_LABEL_HEIGHT = 16;

const WIND_DIRECTION_WINDOW_MIN = 22; // degrees
const WIND_DIRECTION_WINDOW_MAX = 72; // degrees
const WIND_DIRECTION_WINDOW_RANGE =
    WIND_DIRECTION_WINDOW_MAX - WIND_DIRECTION_WINDOW_MIN; // degrees

export const WIND_DIRECTION_WINDOW_CENTER =
    WIND_DIRECTION_WINDOW_MIN + WIND_DIRECTION_WINDOW_RANGE / 2; // degrees

export const CHART_HEIGHT = 200; // px

export const CHART_WIND_DIRECTION_WINDOW_HEIGHT =
    (WIND_DIRECTION_WINDOW_RANGE / 360) * 100; // %
export const CHART_WIND_DIRECTION_WINDOW_Y =
    (100 - CHART_WIND_DIRECTION_WINDOW_HEIGHT) / 2; // %

export const CHART_WIND_SPEED_RANGE_KMH = {
    start: 0,
    end: 46.3,
};
export const CHART_WIND_SPEED_RANGE_KT = {
    start: 0,
    end: 25,
};

export interface YLabels {
    y: number[];
    labels: string[];
}

export const getYLabels = (ci: boolean): YLabels => {
    let y: number[] = [];
    let labels: string[] = [];

    const min = ci
        ? CHART_WIND_SPEED_RANGE_KMH.start
        : CHART_WIND_SPEED_RANGE_KT.start;
    const max = ci
        ? CHART_WIND_SPEED_RANGE_KMH.end
        : CHART_WIND_SPEED_RANGE_KT.end;

    let interval = getLabelsInterval(
        max - min,
        Y_AXIS_INTERVALS,
        MIN_Y_LABELS_COUNT,
        MAX_Y_LABELS_COUNT
    );

    let labelShouldBeAddedBy = min;
    for (let value = min; value <= min + interval; value++) {
        if (value % interval === 0) {
            labelShouldBeAddedBy = value;
            break;
        }
    }

    const pixelsPerUnit = CHART_HEIGHT / (max - min);

    let yCoordinate = Math.round(
        CHART_HEIGHT -
            (labelShouldBeAddedBy - min) * pixelsPerUnit +
            Y_LABEL_HEIGHT
    );

    while (yCoordinate > Y_LABEL_HEIGHT) {
        if (yCoordinate <= CHART_HEIGHT) {
            labels.push(`${Math.round(labelShouldBeAddedBy)}`);
            y.push(yCoordinate);
        }

        labelShouldBeAddedBy += interval;

        yCoordinate = Math.round(
            CHART_HEIGHT -
                (labelShouldBeAddedBy - min) * pixelsPerUnit +
                Y_LABEL_HEIGHT
        );
    }

    return {
        y,
        labels,
    };
};

const degreeToLabel = (degree: number): string => {
    const val = Math.floor(degree / 22.5 + 0.5);
    const arr = [
        'N',
        'NNE',
        'NE',
        'ENE',
        'E',
        'ESE',
        'SE',
        'SSE',
        'S',
        'SSW',
        'SW',
        'WSW',
        'W',
        'WNW',
        'NW',
        'NNW',
    ];
    return arr[val % 16];
};

const oneEightyScopedDeg = (deg: number): number => {
    return deg > 180 ? deg - 360 : deg;
};

export const getYDirectionLabels = (): YLabels => {
    let y: number[] = [];
    let labels: string[] = [];

    const pixelsPerDegree = CHART_HEIGHT / 360;

    let degreesFromTopToZero = 180 - WIND_DIRECTION_WINDOW_CENTER;
    degreesFromTopToZero =
        degreesFromTopToZero < 0
            ? degreesFromTopToZero + 360
            : degreesFromTopToZero;

    [270, 0, 90, 180].forEach((deg) => {
        const yCoordinate =
            (degreesFromTopToZero + oneEightyScopedDeg(deg)) * pixelsPerDegree;
        labels.push(degreeToLabel(deg));
        y.push(yCoordinate);
    });

    return {
        y,
        labels,
    };
};
