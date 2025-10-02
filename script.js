var map = L.map('map').setView([-27.55, 153.2], 12);

// Base layers
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
});

// Google Hybrid (satellite + street names)
var googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    attribution: 'Imagery © Google',
    maxZoom: 20
}).addTo(map);

var baseMaps = {
    "OpenStreetMap": osm,
    "Google Hybrid": googleHybrid
};

L.control.layers(baseMaps).addTo(map);

var featureIndex = {};
var labelLayers = []; // store label tooltips

// Define color by CutsPerYear property
function getColor(cuts) {
    if (cuts == 18) return 'blue';
    if (cuts == 15) return 'green';
    return 'red';
}

// Load GeoJSON
fetch('data.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
        style: function(feature) {
            var cuts = 0;
            if (feature.properties && feature.properties.description) {
                var desc = feature.properties.description.value;
                var match = desc.match(/CutsPerYear<\/td><td>(\d+)<\/td>/);
                if (match) cuts = parseInt(match[1]);
            }
            return {
                color: getColor(cuts),
                weight: 2,
                fillOpacity: 0.2
            };
        },
        onEachFeature: function (feature, layer) {
            var name = feature.properties.name || '';
            var mowID = '';
            var cuts = '';
            if (feature.properties && feature.properties.description) {
                var desc = feature.properties.description.value;
                var idMatch = desc.match(/MowingID<\/td><td>(.*?)<\/td>/);
                if (idMatch) mowID = idMatch[1];
                var cutMatch = desc.match(/CutsPerYear<\/td><td>(\d+)<\/td>/);
                if (cutMatch) cuts = cutMatch[1];
            }
            var popupText = name;
            if (mowID) popupText += " (" + mowID + ")";
            if (cuts) popupText += " - " + cuts + " cuts/yr";
            layer.bindPopup(popupText);
            if (mowID) {
                var tooltip = layer.bindTooltip(mowID, {
                    permanent: true,
                    direction: 'center',
                    className: 'mowing-id-label'
                });
                labelLayers.push(tooltip);
            }
            if (mowID) featureIndex[mowID.toLowerCase()] = layer;
        }
    }).addTo(map);
  });

// Manage label visibility by zoom level
map.on('zoomend', function() {
    var currentZoom = map.getZoom();
    labelLayers.forEach(function(layer) {
        if (currentZoom >= 15) {
            layer.openTooltip();
        } else {
            layer.closeTooltip();
        }
    });
});

// Search box
var searchBox = L.control({position: 'topleft'});
searchBox.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'search-box');
    div.innerHTML = '<input type="text" id="customSearch" placeholder="Search ID..." style="padding:4px;width:120px;">';
    return div;
};
searchBox.addTo(map);

document.addEventListener('keyup', function(e) {
    if (e.target && e.target.id === 'customSearch') {
        var query = e.target.value.toLowerCase();
        if (query.length > 1) {
            for (var key in featureIndex) {
                if (key.includes(query)) {
                    map.fitBounds(featureIndex[key].getBounds());
                    featureIndex[key].openPopup();
                    break;
                }
            }
        }
    }
});


// ========================= NEW CODE ADDED BELOW =========================

// Save completion with date in AEST
function markCompleted(itemId) {
    let userData = JSON.parse(localStorage.getItem("userData")) || {};
    userData[itemId] = {
        completed: true,
        date: new Date().toLocaleDateString("en-AU", { timeZone: "Australia/Brisbane" })
    };
    localStorage.setItem("userData", JSON.stringify(userData));
}

// Hook checkboxes so when user ticks, we call markCompleted
document.addEventListener("change", function(e) {
    if (e.target && e.target.type === "checkbox") {
        var id = e.target.getAttribute("data-id") || e.target.id || e.target.name;
        if (id) {
            markCompleted(id);
        }
    }
});

// Export to PDF with Date column
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let userData = JSON.parse(localStorage.getItem("userData")) || {};

    // Table header
    const headers = ["Date", "Item", "Status"];
    let rows = [];

    Object.keys(userData).forEach(id => {
        let entry = userData[id];
        rows.push([
            entry.date || "",
            id,
            entry.completed ? "Done" : ""
        ]);
    });

    if (doc.autoTable) {
        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 20
        });
    } else {
        let y = 20;
        doc.text(headers.join(" | "), 10, y);
        y += 10;
        rows.forEach(r => {
            doc.text(r.join(" | "), 10, y);
            y += 10;
        });
    }

    doc.save("parks-report.pdf");
}
