import { render } from 'preact';
import {
    MutableRef,
    StateUpdater,
    useEffect,
    useRef,
    useState,
} from 'preact/hooks';
import { Header } from './Header/Header';
import { Latest } from './Latest/Latest';
import { WindCharts } from './WindCharts/WindCharts';
import DataManager from './data/dataManager';
import './style.css';
import { useDocumentVisible } from './utils/useDocumentVisible';

const HOBO_WEBSOCKET_URL =
    'wss://api-onset-prod.scriptrapps.io//RThGMDEzNDc3NA==';
export const CHART_DATA_INTERVAL = 1000 * 3600 * 2; // 2h
export const STATION_REQUEST_INTERVAL = 1000 * 10;

export enum STATION_DATA {
    TIMESTAMP = 0,
    WIND,
    GUST,
    DIRECTION,
}

export interface StationData {
    timestamp: number;
    wind: number; // kmh
    gust: number; // kmh
    direction: number; // degrees
}

/**
 * Used mock weather station data for testing purposes
 */
// const useMockStationData = (setStationData: StateUpdater<StationData[]>) => {
//     const mockData = [
//         [1699057500000, 7.1, 8.4, 6],
//         [1699057800000, 7.1, 8.4, 6],
//         [1699058100000, 5.8, 7.8, 8],
//         [1699058400000, 5.8, 7.1, 8],
//         [1699058700000, 6.5, 7.8, 11],
//         [1699059000000, 6.5, 7.8, 11],
//         [1699059300000, 6.5, 7.8, 17],
//         [1699059600000, 6.5, 7.8, 21],
//         [1699059900000, 6.5, 7.8, 15],
//         [1699060200000, 7.1, 8.4, 17],
//         [1699060500000, 5.8, 7.1, 15],
//         [1699060800000, 3.9, 4.5, 15],
//         [1699061100000, 2.6, 4.5, 27],
//         [1699061400000, 1.9, 3.2, 14],
//         [1699061700000, 1.3, 2.6, 350],
//         [1699062000000, 0.6, 2.6, 253],
//         [1699062300000, 1.3, 2.6, 177],
//         [1699062600000, 0.6, 1.9, 184],
//         [1699062900000, 10, 20, 199],
//         [1699063200000, 1.3, 3.2, 199],
//         [1699063500000, 30, 40, 181],
//     ];
//     const stationData: StationData[] = mockData.map((entry: number[]) => {
//         return {
//             timestamp: entry[STATION_DATA.TIMESTAMP],
//             wind: entry[STATION_DATA.WIND],
//             gust: entry[STATION_DATA.GUST],
//             direction: entry[STATION_DATA.DIRECTION],
//         };
//     });
//     setStationData(stationData);
// };

const onStationDataRecieved = (
    data: number[][],
    isDocumentVisible: boolean,
    setStationData: StateUpdater<StationData[]>,
    timeout: MutableRef<number>,
    dm: DataManager
) => {
    console.dir(data);
    const stationData: StationData[] = data.map((entry: number[]) => {
        return {
            timestamp: entry[STATION_DATA.TIMESTAMP],
            wind: entry[STATION_DATA.WIND],
            gust: entry[STATION_DATA.GUST],
            direction: entry[STATION_DATA.DIRECTION],
        };
    });
    setStationData(stationData);
    if (timeout.current !== undefined) {
        clearTimeout(timeout.current);
    }
    // Request new station data only if current browser tab is active.
    // This results in saving battery for mobile devices, less data usage,
    // and less requests to the server.
    if (isDocumentVisible) {
        timeout.current = setTimeout(() => {
            const now = Date.now();
            dm.RequestTSData(
                'ts-all',
                [
                    dm.Streams.WindSpeed,
                    dm.Streams.GustSpeed,
                    dm.Streams.WindDirection,
                ],
                now - CHART_DATA_INTERVAL,
                now
            );
        }, STATION_REQUEST_INTERVAL);
    }
};

export function App() {
    const [stationData, setStationData] = useState<StationData[]>([]);
    const timeout = useRef<number>();
    const isDocumentVisible = useDocumentVisible();

    useEffect(() => {
        function ErrorHandler(event: string) {
            console.log('ErrorHandler: Received error event= ' + event);
        }
        function TSDataUpdater(data: number[][]) {
            onStationDataRecieved(
                data,
                isDocumentVisible,
                setStationData,
                timeout,
                dm
            );
        }
        function LiveDataUpdater(data: any) {
            console.dir(data);
        }
        console.log('Starting WSS connection');
        const ws = new WebSocket(HOBO_WEBSOCKET_URL);
        const dm = new DataManager(
            ws,
            TSDataUpdater,
            LiveDataUpdater,
            ErrorHandler
        );
        ws.onopen = function (event) {
            console.log(event);
            console.log('Successfully connected to the websocket server...');
            const now = Date.now();
            dm.RequestTSData(
                'ts-all',
                [
                    dm.Streams.WindSpeed,
                    dm.Streams.GustSpeed,
                    dm.Streams.WindDirection,
                ],
                now - CHART_DATA_INTERVAL,
                now
            );
            // dm.RequestLatestData('latest-ws', dm.Streams.WindSpeed);
        };
        return () => {
            if (timeout.current !== undefined) {
                clearTimeout(timeout.current);
            }
            console.log('Closing WSS connection');
            ws.close();
        };

        // useMockStationData(setStationData);
    }, [isDocumentVisible]);

    return (
        <>
            <Header />
            {stationData.length > 0 ? (
                <>
                    <Latest
                        latestDataEntry={stationData[stationData.length - 1]}
                    />
                    <WindCharts stationData={stationData} />
                </>
            ) : (
                <>Loading...</>
            )}
        </>
    );
}

render(<App />, document.getElementById('app'));
