
// app.js - Leaflet map + Fuse.js fuzzy search
let map = L.map('map', {zoomControl: true}).setView([-27.47, 153.03], 12);

// Satellite basemap (Esri)
L.tileLayer.provider('Esri.WorldImagery').addTo(map);

// Layer group for GeoJSON features
let featureLayer = L.geoJSON(null, {
  onEachFeature: function(feature, layer) {
    let p = feature.properties || {};
    let id = p.UniqueID || p.MowingID || p.id || 'unknown';
    let name = p.Name || p.name || '';
    let cuts = p.CutsPerYear || p.Cuts || p.cuts || '';
    let popupHtml = '<strong>' + id + '</strong><br/>' + name + '<br/>Cuts per year: ' + cuts;
    layer.bindPopup(popupHtml);
  },
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, {radius:6, weight:1, fillOpacity:0.9});
  },
  style: function(feature) {
    // color by CutsPerYear simple scheme (optional)
    let cuts = (feature.properties && (feature.properties.CutsPerYear || feature.properties.Cuts)) || null;
    if (cuts === 15) return {color: 'green'};
    if (cuts === 18) return {color: 'blue'};
    return {color: '#ff7800'};
  }
}).addTo(map);

// Load GeoJSON from local file
fetch('data.geojson').then(r => r.json()).then(data => {
  featureLayer.addData(data);
  fitMapToData();
  setupSearchIndex(data);
}).catch(err => {
  console.error('Failed to load data.geojson', err);
});

function fitMapToData() {
  if (featureLayer.getLayers().length > 0) {
    map.fitBounds(featureLayer.getBounds(), {padding: [20,20]});
  }
}

// Prepare Fuse.js index
let fuse;
let allFeatures = [];

function setupSearchIndex(geojson) {
  allFeatures = (geojson.features || []).map((f, idx) => {
    let props = f.properties || {};
    return {
      idx: idx,
      UniqueID: (props.UniqueID || props.uniqueID || props['Unique Id'] || '') + '',
      MowingID: (props.MowingID || props.MowingId || props.MOWINGID || '') + '',
      display: (props.UniqueID || props.MowingID || props.Name || props.name || '') + '',
      props: props
    };
  });

  let options = {
    keys: ['UniqueID', 'MowingID', 'display'],
    threshold: 0.35, // adjust sensitivity
    ignoreLocation: true,
  };
  fuse = new Fuse(allFeatures, options);
}

// UI: search box + suggestions
const searchBox = document.getElementById('searchBox');
const suggestionsDiv = document.getElementById('suggestions');

function clearSuggestions() {
  suggestionsDiv.innerHTML = '';
  suggestionsDiv.classList.add('hidden');
}

function showSuggestions(list) {
  suggestionsDiv.innerHTML = '';
  if (!list || list.length === 0) {
    clearSuggestions();
    return;
  }
  list.slice(0, 10).forEach(item => {
    let div = document.createElement('div');
    div.className = 'suggestion-item';
    let id = item.item ? (item.item.UniqueID || item.item.MowingID || item.item.display) : (item.UniqueID || item.MowingID || item.display);
    let label = id + (item.item && item.item.props && item.item.props.Name ? ' — ' + item.item.props.Name : '');
    div.innerText = label;
    div.onclick = () => {
      selectFeature(item.item || item);
      clearSuggestions();
    };
    suggestionsDiv.appendChild(div);
  });
  suggestionsDiv.classList.remove('hidden');
}

searchBox.addEventListener('input', function(e) {
  let q = e.target.value.trim();
  if (!q) { clearSuggestions(); return; }
  // First try exact match on UniqueID/MowingID
  let exact = allFeatures.find(f => (f.UniqueID && f.UniqueID.toLowerCase() === q.toLowerCase()) || (f.MowingID && f.MowingID.toLowerCase() === q.toLowerCase()));
  if (exact) {
    showSuggestions([exact]);
    return;
  }
  // Fuzzy search with Fuse.js
  if (fuse) {
    let results = fuse.search(q);
    // If first result is a very close match, show it first
    showSuggestions(results);
  }
});

searchBox.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    // take first suggestion if present
    let first = suggestionsDiv.querySelector('.suggestion-item');
    if (first) first.click();
  }
});

document.addEventListener('click', function(e) {
  if (!document.getElementById('topbar').contains(e.target)) {
    clearSuggestions();
  }
});

function selectFeature(selected) {
  // selected is an object from allFeatures
  let idx = selected.idx;
  // find original feature - rely on loaded geojson in featureLayer
  let layers = featureLayer.getLayers();
  if (idx >= 0 && idx < layers.length) {
    let layer = layers[idx];
    if (layer.getBounds) {
      map.fitBounds(layer.getBounds(), {maxZoom: 17, padding:[30,30]});
    } else if (layer.getLatLng) {
      map.setView(layer.getLatLng(), 17);
    }
    layer.openPopup();
  } else {
    // fallback: search by property match
    featureLayer.eachLayer(function(layer) {
      let p = layer.feature && layer.feature.properties;
      if (!p) return;
      if ((p.UniqueID && (p.UniqueID === selected.UniqueID || p.UniqueID === selected.MowingID)) ||
          (p.MowingID && (p.MowingID === selected.MowingID || p.MowingID === selected.UniqueID))) {
        if (layer.getBounds) map.fitBounds(layer.getBounds(), {maxZoom:17, padding:[30,30]}); 
        else if (layer.getLatLng) map.setView(layer.getLatLng(), 17);
        layer.openPopup();
      }
    });
  }
}
