import { formatTimeHHMM, getLabelsInterval } from '@/utils/utils';
import type { TimeRange } from '../chartsData';

/**
 * Possible intervals between labels, minutes
 */
const X_AXIS_INTERVALS: number[] = [300, 180, 60, 30, 15, 10, 5];
const MIN_X_LABELS_COUNT = 1;

export interface XLabels {
    x: number[];
    labels: string[];
}

export const getXLabels = (
    chartTimeRange: TimeRange,
    width: number
): XLabels => {
    let x: number[] = [];
    let labels: string[] = [];

    const range = (chartTimeRange.end - chartTimeRange.start) / 60000;

    const labelWidth = 30; // TODO: make it better
    const padding = labelWidth / 5;
    const maxLabelsCount = Math.round((width + padding) / labelWidth);

    const interval =
        getLabelsInterval(
            range,
            X_AXIS_INTERVALS,
            MIN_X_LABELS_COUNT,
            maxLabelsCount
        ) *
        60 *
        1000;

    let labelShouldBeAddedBy = chartTimeRange.start;
    for (
        let t = chartTimeRange.start;
        t < chartTimeRange.start + interval;
        t++
    ) {
        if (t % interval === 0) {
            labelShouldBeAddedBy = t;
            break;
        }
    }

    const pixelsForMs =
        (width + padding) / (chartTimeRange.end - chartTimeRange.start);

    let label = formatTimeHHMM(labelShouldBeAddedBy);

    let xCoordinate = Math.round(
        (labelShouldBeAddedBy - chartTimeRange.start) * pixelsForMs -
            labelWidth / 2
    );

    while (xCoordinate <= width + padding - labelWidth) {
        if (xCoordinate > -5) {
            labels.push(label);
            x.push(xCoordinate);
        }

        labelShouldBeAddedBy += interval;
        label = formatTimeHHMM(labelShouldBeAddedBy);
        xCoordinate = Math.round(
            (labelShouldBeAddedBy - chartTimeRange.start) * pixelsForMs -
                labelWidth / 2
        );
    }

    return {
        x,
        labels,
    };
};
