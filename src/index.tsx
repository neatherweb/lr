import { render } from 'preact';
import './style.css';
import { useEffect } from 'preact/hooks';
import DataManager from './data/dataManager';

const HOBO_WEBSOCKET_URL =
    'wss://api-onset-prod.scriptrapps.io//RThGMDEzNDc3NA==';

export function App() {
    useEffect(() => {
        function ErrorHandler(event) {
            console.log('ErrorHandler: Received error event= ' + event);
            // toast.add({
            //     severity: 'error',
            //     summary: 'Disconnected',
            //     detail: 'Lost connection to weather data service. Reload the page to try again.',
            //     life: 4000,
            // });
        }
        function TSDataUpdater(data) {
            console.log('TSDataUpdater: data.length=' + data.length);
            console.dir(data);
        }

        function LiveDataUpdater(data) {
            console.log('LiveDataUpdater: data.length=' + data.length);
            console.dir(data);
            if (data.length > 0) {
                console.log(
                    `Latest station data as of: ${new Date(data[0].date)}`
                );
            }
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
            // toast.add({
            //     severity: 'success',
            //     summary: 'Connected',
            //     detail: 'Connected to weather data service',
            //     life: 2000,
            // });
            const currentTime = Date.now();
            dm.RequestTSData(
                'ts-all',
                [
                    dm.Streams.WindSpeed,
                    dm.Streams.GustSpeed,
                    dm.Streams.WindDirection,
                ],
                currentTime - 1000 * 3600,
                currentTime
            );
            dm.RequestLatestData('latest-ws', dm.Streams.WindSpeed);
        };
    }, []);

    return (
        <>
            <header>
                <h1>Long Reef weather station</h1>
                <a href="https://www.flysydney.com.au/" class="logo">
                    <img
                        src="./assets/SPHGC.png"
                        alt="SPHGC logo"
                        height="50"
                        width="50"
                    />
                </a>
            </header>
            <section class="chart">Wind speed</section>
            <section class="chart">Wind direction</section>
        </>
    );
}

// function Resource(props) {
//     return (
//         <a href={props.href} target="_blank" class="resource">
//             <h2>{props.title}</h2>
//             <p>{props.description}</p>
//         </a>
//     );
// }

render(<App />, document.getElementById('app'));
