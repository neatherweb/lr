import { useEffect, useState } from 'preact/hooks';
import { StationData } from '.';
import {
    formatDateTime,
    formatToOneGuaranteedDecimalPlace,
    kmhToKnots,
} from './utils';

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

    return latestDataEntry ? (
        <div class="latest">
            <div class="title">
                {formatDateTime(latestDataEntry.timestamp)}
                {sinceLatestData > 60000 ? (
                    <>, {Math.floor(sinceLatestData / 60000)} min ago</>
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
                <svg viewBox="0 0 50 50" width="50" height="50" class="circle">
                    <path
                        id="arc"
                        fill="#9aed8b"
                        stroke="none"
                        fill-rule="evenodd"
                        d="M 48.77641290737884 17.274575140626315 A 25 25 0 0 0 34.3651648353978 1.8204036358303135 L 25 25 Z M 41.16796077701761 19.746711095625894 A 17 17 0 0 0 31.368312088070503 9.237874472364613 L 25 25 Z"
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
    ) : null;
};
