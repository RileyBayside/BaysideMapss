// script.js — builds the Leaflet map once; filters by allowIds; highlights focusIds

window.BaysideMaps = window.BaysideMaps || {};

// Normalize a site ID from feature properties
function getSiteIdFromProps(p) {
  if (!p) return '';
  return String(p.code || p.id || p.NAME || p.name || '').toUpperCase();
}

// Create the map. Options:
// { containerId, geojsonUrl, allowIds: string[]|null, focusIds: string[] }
BaysideMaps.initParksMowingMap = async function initParksMowingMap(options = {}) {
  if (BaysideMaps._bootstrapped) return; // safety (avoid "already initialised")
  BaysideMaps._bootstrapped = true;

  const containerId = options.containerId || 'map';
  const geojsonUrl  = options.geojsonUrl  || 'data.geojson';

  const allowSet = Array.isArray(options.allowIds)
    ? new Set(options.allowIds.map(s => String(s).toUpperCase()))
    : null;
  const focusSet = Array.isArray(options.focusIds)
    ? new Set(options.focusIds.map(s => String(s).toUpperCase()))
    : new Set();

  // Leaflet map
  const map = L.map(containerId, { zoomControl:true, attributionControl:false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map);

  // Load data
  const resp = await fetch(geojsonUrl);
  const gj   = await resp.json();
  const all  = Array.isArray(gj.features) ? gj.features : [];

  // Filter by allow-list if present
  const features = allowSet ? all.filter(f => allowSet.has(getSiteIdFromProps(f.properties))) : all;

  // Style: focused IDs emphasized
  const layer = L.geoJSON(features, {
    style: (feat) => {
      const id = getSiteIdFromProps(feat.properties);
      const isFocus = focusSet.has(id);
      return isFocus
        ? { color:'#b91c1c', weight:3, fillColor:'#ef4444', fillOpacity:0.35 }
        : { color:'#1d4ed8', weight:2, fillColor:'#60a5fa', fillOpacity:0.25 };
    }
  }).addTo(map);

  // Fit bounds (prefer focus items)
  const boundsFocus = L.latLngBounds([]);
  if (focusSet.size) {
    layer.eachLayer(l => {
      try {
        const id = getSiteIdFromProps(l.feature?.properties);
        if (focusSet.has(id)) {
          const b = l.getBounds ? l.getBounds() : null;
          if (b) boundsFocus.extend(b);
        }
      } catch {}
    });
  }
  if (boundsFocus.isValid()) map.fitBounds(boundsFocus.pad(0.08));
  else {
    const b = layer.getBounds();
    if (b && b.isValid()) map.fitBounds(b.pad(0.08));
    else map.setView([-27.5, 153.2], 11);
  }

  // Expose for sidebar.js
  BaysideMaps.currentMap       = map;
  BaysideMaps.currentLayer     = layer;
  BaysideMaps.currentFeatures  = features;
  BaysideMaps.currentAllowSet  = allowSet;
  BaysideMaps.currentFocusSet  = focusSet;

  // If a sidebar renderer exists, call it now
  if (typeof BaysideMaps.renderSidebar === 'function') {
    BaysideMaps.renderSidebar({
      features, allowSet, focusSet, map, layer
    });
  }
};

// Auto-init once DOM is ready, using any pending options prepared by the HTML page.
document.addEventListener('DOMContentLoaded', () => {
  const opts = (window.BaysideMaps && BaysideMaps.pendingInitOptions) || {
    containerId: 'map', geojsonUrl: 'data.geojson', allowIds: null, focusIds: []
  };
  BaysideMaps.initParksMowingMap(opts);
});
