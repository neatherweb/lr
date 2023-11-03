const streams = {
    WindSpeed: '21868479-21864669-1-1-Wind_Speed',
    GustSpeed: '21868479-21864669-2-1-Gust_Speed',
    WindDirection: '21868479-21864669-3-1-Wind_Direction',
};

const ApiMethods = {
    GetUserData: 'app/api/dashboard/GetUserData',
};

function getTSParams(streams: any, from_date: any, to_date: any) {
    const body = {
        dataType: 'raw',
        streams: streams,
        dataFormat: 'dygraphs',
        aggregationRange: 10,
        display_metric: 'si',
        fetchPeriod: 'past_day',
        fetchTimeZone: 'Australia/Sydney',
        dockey: '518E7EB4CE5AFEEC894D92E671A312D3',
        from_date: from_date,
        to_date: to_date,
    };
    return body;
}

function getLatestParams(stream: any) {
    const body = {
        dataType: 'latest',
        streams: stream,
        dataFormat: 'live',
        aggregationRange: 10,
        display_metric: 'si',
        fetchPeriod: 'past_day',
        fetchTimeZone: 'Australia/Sydney',
        dockey: '518E7EB4CE5AFEEC894D92E671A312D3',
    };
    return body;
}

function requestTSData(
    conn: WebSocket,
    id: string,
    streams: any[],
    from_date: number,
    to_date: number
) {
    const payload = {
        method: ApiMethods.GetUserData,
        params: {
            body: JSON.stringify(getTSParams(streams, from_date, to_date)),
        },
        id: id,
    };

    if (conn.readyState == conn.OPEN) {
        console.log('Using WSS conn' + conn);
        console.log('payload=' + JSON.stringify(payload));
        conn.send(JSON.stringify(payload));
    }
}

function requestLatestData(conn: WebSocket, id: string, streams: any[]) {
    const payload = {
        method: ApiMethods.GetUserData,
        params: {
            body: JSON.stringify(getLatestParams(streams)),
        },
        id: id,
    };

    if (conn.readyState == conn.OPEN) {
        console.log('Using WSS conn' + conn);
        console.log('payload=' + JSON.stringify(payload));
        conn.send(JSON.stringify(payload));
    }
}

export default class DataManager {
    constructor(
        private readonly conn: WebSocket,
        tsdataUpdater: (arg0: any) => void,
        livedataUpdater: (arg0: any) => void,
        errorHandler: (arg0: any) => void
    ) {
        this.conn = conn;
        this.conn.onmessage = function (event: { data: string }) {
            console.log(event);
            const data = JSON.parse(event.data);
            console.log('Status=' + data.status);
            if (
                data.status == 'success' &&
                Object.hasOwn(data.result, 'data')
            ) {
                // time-series response has data property
                tsdataUpdater(data.result.data);
            } else if (
                data.status == 'success' &&
                Object.hasOwn(data.result[0], 'value')
            ) {
                // a single 'latest' response has value property
                livedataUpdater(data.result);
            } else if (data.result == 'connected.') {
                // Do nothing for connection event for now - but could add handler for presentation layer if needed
            } else {
                //TODO: might need more connection management on errors
                errorHandler(event);
            }
        };
    }

    /**
     * Sends a request to the websocket to get latest value for
     * one of the metric streams.
     * @function RequestTSData
     * @param {string} id Id is used as reference for the WSS request/response
     * @param {array} streams Array of data stream ids you want the timeseries data from. Use stream.<metric> constants to identify the streams.
     * @param {long} from_date The EPOC time for the start of the data range.
     * @param {long} to_date The EPOC time for the start of the data range.
     */
    RequestTSData(
        id: string,
        streams: any[],
        from_date: number,
        to_date: number
    ) {
        return requestTSData(this.conn, id, streams, from_date, to_date);
    }

    /**
     * Sends a request to the websocket to get latest value for
     * one of the metric streams.
     * @function RequestLatestData
     * @param id Id is used as reference for the WSS request/response
     * @param stream Data stream you want the latest value from. Use stream.<metric> constants to identify the stream.
     */
    RequestLatestData(id: string, stream: any) {
        return requestLatestData(this.conn, id, stream);
    }

    get Streams() {
        return streams;
    }
}
