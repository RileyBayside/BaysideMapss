// sidebar.js — renders just the allowed IDs, provides search + click-to-zoom

window.BaysideMaps = window.BaysideMaps || {};

(function () {
  // Reuse helper from script.js; define if needed
  if (typeof window.getSiteIdFromProps !== 'function') {
    window.getSiteIdFromProps = function (p) {
      if (!p) return '';
      return String(p.code || p.id || p.NAME || p.name || '').toUpperCase();
    };
  }

  BaysideMaps.renderSidebar = function renderSidebar(ctx) {
    const { features, map, layer, allowSet, focusSet } = ctx;

    const host   = document.getElementById('sidebar-content');
    const search = document.getElementById('searchSite');
    const summary = document.getElementById('summaryLine');
    if (!host) return;

    // Summary
    if (summary) {
      const assigned = allowSet ? `${features.length} assigned site${features.length===1?'':'s'}` : 'All sites';
      const focused  = focusSet?.size ? ` · ${focusSet.size} highlighted` : '';
      summary.textContent = assigned + focused;
    }

    // Build list function (so we can re-render on search)
    function buildList(filterText) {
      host.innerHTML = '';
      const q = (filterText || '').trim().toLowerCase();

      const items = features.filter(f => {
        if (!q) return true;
        const p = f.properties || {};
        const id = getSiteIdFromProps(p);
        const name = String(p.name || p.NAME || '').toLowerCase();
        return id.toLowerCase().includes(q) || name.includes(q);
      });

      if (!items.length) {
        const p = document.createElement('p');
        p.style.color = '#64748b';
        p.textContent = allowSet ? 'No assigned sites match your search.' : 'No sites match your search.';
        host.appendChild(p);
        return;
      }

      items.forEach(f => {
        const p  = f.properties || {};
        const id = getSiteIdFromProps(p);
        const name = p.name || p.NAME || '';

        const row = document.createElement('div');
        row.className = 'site-item';

        const left = document.createElement('div');
        left.innerHTML = `<span class="id">${id}</span>${name ? `<span class="name">— ${name}</span>` : ''}`;

        const right = document.createElement('span');
        right.className = 'badge';
        right.textContent = focusSet?.has(id) ? 'Focus' : 'Assigned';

        row.appendChild(left);
        row.appendChild(right);

        row.addEventListener('click', () => {
          // find the leaf layer for this feature, zoom to it
          let target = null;
          layer.eachLayer(l => {
            const lid = getSiteIdFromProps(l.feature?.properties);
            if (lid === id) target = l;
          });
          if (target) {
            const b = target.getBounds ? target.getBounds() : null;
            if (b && b.isValid()) map.fitBounds(b.pad(0.12));
          }
        });

        host.appendChild(row);
      });
    }

    // Initial list + search wire-up
    buildList('');
    if (search) {
      search.addEventListener('input', (e) => buildList(e.target.value));
    }
  };
})();
