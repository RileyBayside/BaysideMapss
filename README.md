
# Leaflet Satellite Map with Fuzzy Search

Files:
- `index.html` - main page
- `style.css` - styling
- `app.js` - map logic, loads `data.geojson`
- `data.geojson` - your GeoJSON (copied from upload)

Usage:
1. Unzip the folder into a GitHub repository (public or private).
2. Push to GitHub and enable GitHub Pages from the repository settings (use `main` branch / `root`).
3. Open `index.html` from the Pages URL. (No server required.)

Search:
- Use the search box at top to search `UniqueID` or `MowingID` (fuzzy suggestions provided).
- Example: `M0123` or partial `M01` will show close matches.

Notes:
- Satellite tiles are from Esri World Imagery (no token).
- If you want markers styled by a property (e.g., CutsPerYear), modify `app.js` style() function.
