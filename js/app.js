
// Leaflet Satellite map with fuzzy search for "Unique ID"
// Expects data.json (GeoJSON FeatureCollection) in same folder.
// The search is "smart": if exact match not found it suggests close matches using Fuse.js.

const map = L.map('map').setView([-27.4705, 153.0260], 12); // default view (Brisbane). Update if you want.

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/' +
  'World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
}).addTo(map);

let geojsonLayer;
let allFeatures = []; // array of features for Fuse
let fuse;

function propertyCandidates(props) {
  // return the Unique ID value from various possible property keys
  const keys = ['Unique ID','UniqueID','Unique_Id','Unique_Id','unique_id','MowingID','Mowing ID','MowingId','MowingID'];
  for (const k of keys) {
    if (props && Object.prototype.hasOwnProperty.call(props, k) && props[k]) return String(props[k]);
  }
  // fallback: try common keys
  if (props && props.id) return String(props.id);
  return '';
}

function buildPopupContent(props) {
  let html = '<div class="popup-content">';
  for (const k in props) {
    html += '<strong>' + k + ':</strong> ' + props[k] + '<br/>';
  }
  html += '</div>';
  return html;
}

function onEachFeature(feature, layer) {
  if (feature.properties) {
    layer.bindPopup(buildPopupContent(feature.properties));
  }
}

function pointToLayer(feature, latlng) {
  return L.circleMarker(latlng, {
    radius: 6,
    weight: 1,
    opacity: 1,
    fillOpacity: 0.9
  });
}

function loadData() {
  fetch('data.json')
    .then(r => r.json())
    .then(geojson => {
      // clear existing
      if (geojsonLayer) map.removeLayer(geojsonLayer);

      geojsonLayer = L.geoJSON(geojson, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
      }).addTo(map);

      // Prepare search list for Fuse
      const features = geojson.features || [];
      allFeatures = features.map((f, idx) => {
        const uid = propertyCandidates(f.properties) || ('feature-' + idx);
        // compute a small preview text
        const preview = uid + (f.properties && f.properties.Name ? (' — ' + f.properties.Name) : '');
        // store geometry coords for quick access
        let coords = null;
        if (f.geometry) {
          const g = f.geometry;
          if (g.type === 'Point') coords = [g.coordinates[1], g.coordinates[0]];
        }
        return {
          uid: uid,
          preview: preview,
          props: f.properties || {},
          geometry: f.geometry,
          coords: coords,
          index: idx
        };
      });

      // Setup Fuse for fuzzy searching on uid
      fuse = new Fuse(allFeatures, {
        keys: ['uid', 'preview'],
        threshold: 0.35,
        ignoreLocation: true,
        distance: 100
      });

      // Fit map to data if bounds available
      try {
        const bounds = geojsonLayer.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds.pad(0.15));
      } catch(e) { console.warn(e); }
    })
    .catch(err => {
      console.error('Failed to load data.json:', err);
      alert('Could not load data.json. Make sure the file exists and is valid GeoJSON (FeatureCollection).');
    });
}

function zoomToFeatureByIndex(idx) {
  const layer = geojsonLayer.getLayers()[idx];
  if (!layer) return;
  const g = layer.feature && layer.feature.geometry;
  if (g && (g.type === 'Point' || g.type === 'MultiPoint')) {
    const latlng = layer.getLatLng ? layer.getLatLng() : null;
    if (latlng) {
      map.setView(latlng, Math.max(map.getZoom(), 16));
      layer.openPopup();
    } else {
      map.fitBounds(layer.getBounds());
      layer.openPopup();
    }
  } else {
    // polygon / line
    if (layer.getBounds) {
      map.fitBounds(layer.getBounds().pad(0.12));
      layer.openPopup();
    } else {
      map.setView(map.getCenter(), 13);
      layer.openPopup();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();

  const input = document.getElementById('search');
  const suggestions = document.getElementById('suggestions');

  function showSuggestions(items) {
    suggestions.innerHTML = '';
    if (!items || items.length === 0) {
      suggestions.classList.add('hidden');
      return;
    }
    for (const it of items) {
      const li = document.createElement('li');
      li.textContent = it.preview + ' (' + it.uid + ')';
      li.dataset.index = it.index;
      li.addEventListener('click', () => {
        suggestions.classList.add('hidden');
        input.value = it.uid;
        zoomToFeatureByIndex(it.index);
      });
      suggestions.appendChild(li);
    }
    suggestions.classList.remove('hidden');
  }

  input.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    if (!q) {
      suggestions.classList.add('hidden');
      return;
    }
    // exact match first
    const exact = allFeatures.find(f => f.uid.toLowerCase() === q.toLowerCase());
    if (exact) {
      showSuggestions([exact]);
      return;
    }
    // fuzzy search
    const results = fuse.search(q, {limit: 8}).map(r => r.item);
    if (results.length === 0) {
      // try wildcard contains
      const contains = allFeatures.filter(f => f.uid.toLowerCase().includes(q.toLowerCase())).slice(0,6);
      if (contains.length) {
        showSuggestions(contains);
        return;
      }
      // show "no matches" item with top 5 as suggestions (like "Did you mean...")
      const top = fuse.search(q, {limit: 5}).map(r => r.item);
      if (top.length) {
        const header = { uid: '', preview: 'No exact match. Did you mean:' };
        showSuggestions([header, ...top]);
      } else {
        suggestions.innerHTML = '<li>No matches found</li>';
        suggestions.classList.remove('hidden');
      }
      return;
    }
    showSuggestions(results);
  });

  // hide suggestions when clicking outside
  document.addEventListener('click', (ev) => {
    if (!document.getElementById('controls').contains(ev.target)) {
      suggestions.classList.add('hidden');
    }
  });

});
