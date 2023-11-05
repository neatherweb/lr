import { TimeRange } from './chartData';
import { formatTimeHHMM, getLabelsInterval } from './utils';

const X_AXIS_INTERVALS: number[] = [3600, 1800, 900, 600, 300, 30, 15];
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

    const range = (chartTimeRange.end - chartTimeRange.start) / 1000;

    const labelWidth = 38; // TODO: make it better
    const maxLabelsCount = Math.round(width / labelWidth);

    const interval =
        getLabelsInterval(
            range,
            X_AXIS_INTERVALS,
            MIN_X_LABELS_COUNT,
            maxLabelsCount
        ) * 1000;

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

    const pixelsForMs = width / (chartTimeRange.end - chartTimeRange.start);

    let label = formatTimeHHMM(labelShouldBeAddedBy);

    let xCoordinate = Math.round(
        (labelShouldBeAddedBy - chartTimeRange.start) * pixelsForMs -
            labelWidth / 2
    );

    while (xCoordinate <= width - labelWidth) {
        if (xCoordinate > 0) {
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
