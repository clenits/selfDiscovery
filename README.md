# selfDiscovery

Static GitHub Pages project with a client-only Self Discovery platform.

## Run locally

1. Open `/Users/dawoonlee/Documents/Github/selfDiscovery/index.html` in a browser, then go to `./discover/`.
2. For service worker testing, serve the folder from a local static server (not `file://`).

Example:

```bash
cd /Users/dawoonlee/Documents/Github/selfDiscovery
python3 -m http.server 8080
```

Open `http://localhost:8080/discover/`.

## Validate quiz JSON

```bash
node discover/tools/validate-json.mjs
```
