import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { StationData } from '..';
import { useResizeObserver } from '../utils/useResizeObserver';
import { XLabels } from './Labels/xLabels';
import {
    CHART_HEIGHT,
    RELATIVE_FLYABLE_WIND_DIRECTION_RANGE_Y,
    RELATIVE_HEIGHT_OF_FLYABLE_WIND_DIRECTION_RANGE,
    YLabels,
} from './Labels/yLabels';
import { ChartsData, getChartsData } from './chartsData';

const CHART_REFRESH_INTERVAL = 3000; // ms

export const WindCharts = ({ stationData }: { stationData: StationData[] }) => {
    const windSpeedWrapperRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(0);

    const [chartsData, setChartsData] = useState<ChartsData>();

    const updateChartWrapperWidth = useCallback(() => {
        const rect = windSpeedWrapperRef.current?.getBoundingClientRect();
        if (!rect) {
            return;
        }
        setChartWidth(rect.width || 0);
    }, [windSpeedWrapperRef]);
    useResizeObserver(windSpeedWrapperRef, updateChartWrapperWidth);

    useEffect(() => {
        let intervalId: number;
        if (chartWidth === 0) {
            setChartsData(undefined);
        } else {
            const chartsData = getChartsData(stationData, chartWidth);
            setChartsData(chartsData);
        }

        intervalId = setInterval(() => {
            if (chartWidth === 0) {
                setChartsData(undefined);
            } else {
                const chartData = getChartsData(stationData, chartWidth);
                setChartsData(chartData);
            }
        }, CHART_REFRESH_INTERVAL);
        return () => {
            if (intervalId !== undefined) {
                clearInterval(intervalId);
            }
        };
    }, [stationData, chartWidth, setChartsData]);

    return (
        <>
            <div class="speedChart">
                <div class="title-kmh">km/h</div>
                <div class="title-kt">kt</div>
                <div ref={windSpeedWrapperRef} class="chart">
                    {chartsData && chartsData.windSpeedXYPoints.length > 0 ? (
                        <svg width="100%" height={CHART_HEIGHT}>
                            <polyline
                                key="gust"
                                fill="none"
                                stroke="#9aed8b"
                                stroke-width="3"
                                points={`0,${chartsData.gustSpeedXYPoints.substring(
                                    chartsData.gustSpeedXYPoints.indexOf(',') +
                                        1,
                                    chartsData.gustSpeedXYPoints.indexOf(' ')
                                )} ${chartsData.gustSpeedXYPoints}`}
                            />
                            <polygon
                                key="wind"
                                fill="#2fa2b7"
                                fill-opacity="0.2"
                                stroke="none"
                                points={`0,${CHART_HEIGHT} 0,${chartsData.windSpeedXYPoints.substring(
                                    chartsData.windSpeedXYPoints.indexOf(',') +
                                        1,
                                    chartsData.windSpeedXYPoints.indexOf(' ')
                                )} ${
                                    chartsData.windSpeedXYPoints
                                } ${chartsData.windSpeedXYPoints.substring(
                                    chartsData.windSpeedXYPoints.lastIndexOf(
                                        ' '
                                    ),
                                    chartsData.windSpeedXYPoints.lastIndexOf(
                                        ','
                                    )
                                )},${CHART_HEIGHT}`}
                            />
                            <polyline
                                fill="none"
                                stroke="#2fa2b7"
                                stroke-width="3"
                                points={`0,${chartsData.windSpeedXYPoints.substring(
                                    chartsData.windSpeedXYPoints.indexOf(',') +
                                        1,
                                    chartsData.windSpeedXYPoints.indexOf(' ')
                                )} ${chartsData.windSpeedXYPoints}`}
                            />
                        </svg>
                    ) : null}
                </div>
                {chartsData ? (
                    <>
                        <TimeAxis xLabels={chartsData.timeLabels} />
                        <KmhAxis yLabels={chartsData.kmhLabels} />
                        <KnotsAxis yLabels={chartsData.ktLabels} />
                    </>
                ) : null}
            </div>
            {chartsData && chartsData.windDirectionXYPoints.length > 0 ? (
                <div class="directionChart">
                    <div class="chart">
                        <svg width="100%" height={CHART_HEIGHT}>
                            <rect
                                width="100%"
                                height={`${RELATIVE_HEIGHT_OF_FLYABLE_WIND_DIRECTION_RANGE}%`}
                                y={`${RELATIVE_FLYABLE_WIND_DIRECTION_RANGE_Y}%`}
                                fill="rgba(155, 237, 140, 0.5)"
                            />
                            {chartsData.windDirectionXYPoints.map((point) => {
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
                    <DirectionAxis yLabels={chartsData.directionLabels} />
                </div>
            ) : null}
        </>
    );
};

const TimeAxis = ({ xLabels }: { xLabels: XLabels }) => {
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

const KmhAxis = ({ yLabels }: { yLabels: YLabels }) => {
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

const KnotsAxis = ({ yLabels }: { yLabels: YLabels }) => {
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
const DirectionAxis = ({ yLabels }: { yLabels: YLabels }) => {
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
