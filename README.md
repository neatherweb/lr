# lr

This project is some quick hacking to develop a replacemnt frontend for our Paragliging/Hangliding site weather station.

## src/data/dataManager.ts

This TS library provides some methods to query the same WebSocket service used by the official HoboLink public dashboard.
The main interfaces are via the `DataManager` class to manage a connection and handle callback functions.
To request new data use the `RequestTSData` or `RequestLatestData` methods (see doc-comments of the methods).

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Perform TypeScript type check

```sh
npm run type-check
```

### Compile and Minify for Production

```sh
npm run build
```
