import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { StationData } from '.';
import { useResizeObserver } from '../useResizeObserver';
import { Latest } from './Latest';
import { getChartData } from './chartData';
import { XLabels } from './xLabels';
import {
    CHART_HEIGHT,
    CHART_WIND_DIRECTION_WINDOW_HEIGHT,
    CHART_WIND_DIRECTION_WINDOW_Y,
    YLabels,
} from './yLabels';

const CHART_REFRESH_INTERVAL = 3000; // ms

export const WindSpeed = ({ stationData }: { stationData: StationData[] }) => {
    const windSpeedWrapperRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(0);

    const [latestDataEntry, setLatestDataEntry] = useState<StationData>();
    const [chartData, setChartData] = useState<
        [string, string, XLabels, YLabels, YLabels, [number, number][], YLabels]
    >([
        '',
        '',
        {
            x: [],
            labels: [],
        },
        {
            y: [],
            labels: [],
        },
        {
            y: [],
            labels: [],
        },
        [],
        {
            y: [],
            labels: [],
        },
    ]);

    const updateChartWrapperWidth = useCallback(() => {
        const rect = windSpeedWrapperRef.current?.getBoundingClientRect();
        if (!rect) {
            return;
        }
        setChartWidth(rect.width || 0);
    }, [windSpeedWrapperRef]);
    useResizeObserver(windSpeedWrapperRef, updateChartWrapperWidth);

    useEffect(() => {
        if (stationData.length > 0) {
            setLatestDataEntry(stationData[stationData.length - 1]);
        }
    }, [stationData]);

    useEffect(() => {
        const chartData = getChartData(stationData, chartWidth);
        setChartData(chartData);

        const intervalId = setInterval(() => {
            const chartData = getChartData(stationData, chartWidth);
            setChartData(chartData);
        }, CHART_REFRESH_INTERVAL);
        return () => {
            clearInterval(intervalId);
        };
    }, [stationData, chartWidth, setChartData]);

    return (
        <>
            <Latest latestDataEntry={latestDataEntry} />
            <div class="speedChart">
                <div class="title-kmh">km/h</div>
                <div class="title-kt">kt</div>
                <div ref={windSpeedWrapperRef} class="chart">
                    <svg width="100%" height={CHART_HEIGHT}>
                        {chartData[1].length > 0 ? (
                            <polyline
                                key="gust"
                                fill="none"
                                stroke="#9aed8b"
                                stroke-width="3"
                                points={`0,${chartData[1].substring(
                                    chartData[0].indexOf(',') + 1,
                                    chartData[0].indexOf(' ')
                                )} ${chartData[1]}`}
                            />
                        ) : null}
                        {chartData[0].length > 0 ? (
                            <>
                                <polygon
                                    key="wind"
                                    fill="#2fa2b7"
                                    fill-opacity="0.2"
                                    stroke="none"
                                    points={`0,${CHART_HEIGHT} 0,${chartData[0].substring(
                                        chartData[0].indexOf(',') + 1,
                                        chartData[0].indexOf(' ')
                                    )} ${chartData[0]} ${chartData[0].substring(
                                        chartData[0].lastIndexOf(' '),
                                        chartData[0].lastIndexOf(',')
                                    )},${CHART_HEIGHT}`}
                                />
                                <polyline
                                    fill="none"
                                    stroke="#2fa2b7"
                                    stroke-width="3"
                                    points={`0,${chartData[0].substring(
                                        chartData[0].indexOf(',') + 1,
                                        chartData[0].indexOf(' ')
                                    )} ${chartData[0]}`}
                                />
                            </>
                        ) : null}
                    </svg>
                </div>
                <TimeAxis xLabels={chartData[2]} />
                <KmhAxis yLabels={chartData[3]} />
                <KnotsAxis yLabels={chartData[4]} />
            </div>
            <div class="directionChart">
                <div class="chart">
                    <svg width="100%" height={CHART_HEIGHT}>
                        <rect
                            width="100%"
                            height={`${CHART_WIND_DIRECTION_WINDOW_HEIGHT}%`}
                            y={`${CHART_WIND_DIRECTION_WINDOW_Y}%`}
                            fill="rgba(155, 237, 140, 0.5)"
                        />
                        {chartData[5].map((point) => {
                            return (
                                <circle
                                    cx={`${point[0]}px`}
                                    cy={`${point[1]}%`}
                                    r="4"
                                    fill="#2fa2b7"
                                />
                            );
                        })}
                    </svg>
                </div>
                <DirectionAxis yLabels={chartData[6]} />
            </div>
        </>
    );
};

export const TimeAxis = ({ xLabels }: { xLabels: XLabels }) => {
    return (
        <div class="timeaxis">
            {xLabels.labels.map((label, i) => {
                return (
                    <div
                        class="xlabel"
                        style={`left: ${xLabels.x[i]}px; ${
                            label.substring(3) === '00'
                                ? 'font-weight: bold;'
                                : ''
                        }`}
                    >
                        <div class="tick"> </div>
                        {label}
                    </div>
                );
            })}
        </div>
    );
};

export const KmhAxis = ({ yLabels }: { yLabels: YLabels }) => {
    return (
        <div class="kmhaxis">
            {yLabels.labels.map((label, i) => {
                return (
                    <div class="ylabel" style={`top: ${yLabels.y[i]}px`}>
                        <span class="tick"> </span>
                        {label}
                    </div>
                );
            })}
        </div>
    );
};

export const KnotsAxis = ({ yLabels }: { yLabels: YLabels }) => {
    return (
        <div class="ktaxis">
            {yLabels.labels.map((label, i) => {
                return (
                    <div class="ylabel" style={`top: ${yLabels.y[i]}px`}>
                        <span class="tick"> </span>
                        {label}
                    </div>
                );
            })}
        </div>
    );
};

export const DirectionAxis = ({ yLabels }: { yLabels: YLabels }) => {
    return (
        <div class="diraxis">
            {yLabels.labels.map((label, i) => {
                return (
                    <div class="ylabel" style={`top: ${yLabels.y[i]}px`}>
                        <span class="tick"> </span>
                        {label}
                    </div>
                );
            })}
        </div>
    );
};
