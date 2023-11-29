import { STATION } from '../station';

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    weekday: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: STATION.TIMEZONE,
});

const timeFormatHHMM = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: STATION.TIMEZONE,
});

export const formatDateTime = (timestamp: number): string => {
    return dateTimeFormat.format(timestamp);
};

export const formatTimeHHMM = (timestamp: number): string => {
    return timeFormatHHMM.format(timestamp);
};

export const kmhToKnots = (kmh: number): number => {
    return kmh / 1.852;
};

export const knotsToKmh = (kt: number): number => {
    return kt * 1.852;
};

const roundToOneDecimalPlace = (num: number): number => {
    return (
        Math.sign(num) *
        (Math.round((Math.abs(num) + Number.EPSILON) * 10) / 10)
    );
};

export const formatToOneGuaranteedDecimalPlace = (num: number): string => {
    const rounded = roundToOneDecimalPlace(num).toString();
    return rounded.includes('.') ? rounded : `${rounded}.0`;
};

export const getLabelsInterval = (
    range: number,
    intervals: number[],
    minLabelsCount: number,
    maxLabelsCount: number
): number => {
    let interval = intervals[0],
        nextInterval = intervals[0];

    let labelsCount = 0,
        nextLabelsCount = 0;
    for (let i = 0; i < intervals.length - 1; i++) {
        interval = intervals[i];
        nextInterval = intervals[i + 1];

        if (interval > range) continue;

        labelsCount = Math.round(range / interval);
        nextLabelsCount = Math.round(range / nextInterval);
        if (
            labelsCount >= minLabelsCount &&
            labelsCount <= maxLabelsCount &&
            (nextLabelsCount > maxLabelsCount || i === intervals.length - 2)
        ) {
            return interval;
        }
    }

    return range / 3;
};
