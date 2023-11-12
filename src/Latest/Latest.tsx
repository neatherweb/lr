import { useEffect, useState } from 'preact/hooks';
import {
    formatDateTime,
    formatToOneGuaranteedDecimalPlace,
    kmhToKnots,
} from '../utils/utils';
import { StationData } from '..';

export const Latest = ({
    latestDataEntry,
}: {
    latestDataEntry: StationData;
}) => {
    const [sinceLatestData, setSinceLatestData] = useState<number>(0);

    useEffect(() => {
        if (latestDataEntry) {
            setSinceLatestData(Date.now() - latestDataEntry.timestamp);
        }
        const intervalId = setInterval(() => {
            if (latestDataEntry) {
                setSinceLatestData(Date.now() - latestDataEntry.timestamp);
            }
        }, 3000);

        return () => {
            clearInterval(intervalId);
        };
    }, [latestDataEntry, setSinceLatestData]);

    return (
        <div class="latest">
            <div class="title">
                {formatDateTime(latestDataEntry.timestamp)}
                {sinceLatestData > 60000 ? (
                    <div>{Math.floor(sinceLatestData / 60000)} min ago</div>
                ) : null}
            </div>
            <div class="wind">
                <div>
                    <span class="unit">gust:</span>{' '}
                    <span class="value">
                        {formatToOneGuaranteedDecimalPlace(
                            latestDataEntry.gust
                        )}
                    </span>{' '}
                    <span class="unit">km/h</span>{' '}
                    <span class="value">
                        {formatToOneGuaranteedDecimalPlace(
                            kmhToKnots(latestDataEntry.gust)
                        )}
                    </span>{' '}
                    <span class="unit">kt</span>
                </div>
                <div>
                    <span class="unit">wind:</span>{' '}
                    <span class="value">
                        {formatToOneGuaranteedDecimalPlace(
                            latestDataEntry.wind
                        )}
                    </span>{' '}
                    <span class="unit">km/h</span>{' '}
                    <span class="value">
                        {formatToOneGuaranteedDecimalPlace(
                            kmhToKnots(latestDataEntry.wind)
                        )}
                    </span>{' '}
                    <span class="unit">kt</span>
                </div>
            </div>
            <div class="direction">
                <svg viewBox="0 0 48 48" width="48" height="48" class="circle">
                    <path
                        id="arc"
                        fill="#9aed8b"
                        stroke="none"
                        fill-rule="evenodd"
                        d="M 46.82535639108369 16.58359213500126 A 24 24 0 0 0 32.99055824198189 1.7475874903971018 L 24 24 Z M 39.21690426072246 19.05572809000084 A 16 16 0 0 0 29.99370549465459 9.165058326931401 L 24 24 Z"
                    ></path>
                </svg>
                <div
                    class="arrow"
                    style={`transform: rotate(${latestDataEntry.direction}deg);`}
                >
                    ↓
                </div>
            </div>
        </div>
    );
};
