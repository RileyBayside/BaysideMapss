// Initialize the map
var map = L.map('map', {
    center: [-27.55, 153.25], // Adjust center as needed
    zoom: 12
});

// Google Hybrid basemap (satellite with streets)
L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0','mt1','mt2','mt3'],
    attribution: 'Imagery © Google'
}).addTo(map);

// Load the parks data
fetch("data/parks.geojson")
  .then(response => response.json())
  .then(data => {
      // Store globally in case other scripts need it
      window.parkData = data;

      // Add to map
      L.geoJSON(data, {
          onEachFeature: function (feature, layer) {
              if (feature.properties && feature.properties.Name) {
                  layer.bindPopup(feature.properties.Name);
              }
          }
      }).addTo(map);

      // ✅ Attach button listeners AFTER data loads
      document.getElementById("showTodayBtn").onclick = () => showToday(data);
      document.getElementById("exportPDFBtn").onclick = () => exportPDF(data);
  });
