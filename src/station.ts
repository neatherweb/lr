export const STATION = {
    NAME: 'Long Reef',
    /** Flyable wind directions, from `MIN` to `MAX`, degrees */
    FLYABLE_WIND_DIRECTIONS: {
        MIN: 30,
        MAX: 80,
    },
    /** Borderline flyable wind directions, from `MIN` to `MAX`, degrees */
    BORDERLINE_WIND_DIRECTIONS: {
        MIN: 20,
        MAX: 90,
    },
    /** Flyable wind speeds, from `MIN` to `MAX`, kmh */
    FLYABLE_WIND_SPEEDS: {
        MIN: 17,
        MAX: 35,
    },
    /** Station time zone name in IANA format https://data.iana.org/time-zones */
    TIMEZONE: 'Australia/Sydney',
    /** URL of the station data's `WebSocket` endpoint */
    HOBO_WEBSOCKET_URL: 'wss://api-onset-prod.scriptrapps.io//RThGMDEzNDc3NA==',
};
