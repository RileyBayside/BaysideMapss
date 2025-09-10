Leaflet Satellite Map - Search by MowingID
================================================

Files:
- index.html : main map page (loads data.geojson)
- data.geojson: converted GeoJSON from your KMZ file
- README.md : this file

Instructions to use on GitHub Pages:
1. Create a new repository on GitHub.
2. Upload all files from this ZIP into the repository root (index.html and data.geojson).
3. In repository settings -> Pages, set branch to main (or gh-pages) and root folder to '/'.
4. Wait a minute and visit the GitHub Pages URL. The map will load the included data.geojson.

Search:
- The search function is configured for the property 'MowingID'. Example: M0123

Styling:
- Features are styled by 'CutsPerYear':
  - 15 cuts = green
  - 18 cuts = blue

Notes:
- The map uses Esri World Imagery for the satellite basemap (no API key required).
