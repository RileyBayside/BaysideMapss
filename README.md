
# Leaflet Satellite Map with Fuzzy Unique ID Search

What you get:
- `index.html` — main page with Leaflet map (satellite basemap via Esri).
- `css/styles.css` — basic styling for map and search box.
- `js/app.js` — map logic: loads `data.json`, builds GeoJSON layer, and provides a fuzzy search for **Unique ID** (e.g. `M0123`) using Fuse.js.
- `data.json` — placeholder example GeoJSON (replace this with your attached JSON/GeoJSON file).

How to use:
1. Replace `data.json` with your actual JSON/GeoJSON file. Keep the filename `data.json` (or update `fetch('data.json')` in `js/app.js`).
2. Commit the files to a GitHub repository and enable GitHub Pages on the repo root (or `gh-pages` branch) to serve `index.html`.
3. Open the page. Use the search box to find Unique IDs (typing partial IDs will show suggestions).

Notes & tips:
- The search looks for several possible property names (e.g. `Unique ID`, `UniqueID`, `MowingID`, `Mowing ID`, etc.). If your file uses a different field name for the ID, either rename that field to `Unique ID` or edit the `propertyCandidates()` function in `js/app.js` to include your field name.
- If your GeoJSON contains polygons or lines, the map will fit to their bounds when selected.
- The map defaults to a Brisbane center. Change `map.setView()` in `js/app.js` if you prefer another start location.

If you want, paste the exact JSON/GeoJSON content here and I can inject it into the ZIP so it opens immediately with your real data.
