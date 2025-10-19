async function loadApps() {
  try {
    const res = await fetch('apps.json');
    if (!res.ok) throw new Error('apps.json konnte nicht geladen werden');
    const apps = await res.json();
    window._apps = apps;
    populateCategories(apps);
    setupSearch(apps);
    renderApps(apps);
  } catch (e) {
    console.error(e);
    document.getElementById('appContainer').innerHTML = '<p style="color:#900">Fehler beim Laden der App-Datei. Siehe Konsole.</p>';
  }
}

function populateCategories(apps){
  const sel = document.getElementById('categorySelect');
  const cats = Array.from(new Set(apps.map(a=>a.category || 'Unk')));
  cats.sort();
  cats.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
  sel.addEventListener('change',()=>renderApps(window._apps, document.getElementById('searchInput').value));
}

function setupSearch(apps){
  const input = document.getElementById('searchInput');
  input.addEventListener('input', ()=> renderApps(apps, input.value));
}

function renderApps(apps, filter=''){
  const cat = document.getElementById('categorySelect').value;
  const container = document.getElementById('appContainer');
  container.innerHTML = '';
  const f = filter.trim().toLowerCase();

  const list = apps.filter(a=>{
    const matchesFilter = !f || a.name.toLowerCase().includes(f) || (a.description && a.description.toLowerCase().includes(f));
    const matchesCat = !cat || (a.category === cat);
    return matchesFilter && matchesCat;
  });

  if(list.length === 0){
    document.getElementById('emptyMsg').classList.remove('hidden');
  } else {
    document.getElementById('emptyMsg').classList.add('hidden');
  }

  list.forEach(app=>{
    const card = document.createElement('article');
    card.className = 'app-card';
    card.innerHTML = `
      <div class="app-hero">
        <div class="app-icon"><img src="${app.image}" alt="${app.name} Icon"></div>
        <div class="app-meta">
          <h3>${app.name}</h3>
          <p>${app.short || app.description || ''}</p>
        </div>
      </div>
      <div class="card-footer">
        <small>${app.version || ''}</small>
        <div>
          <a class="btn btn-ghost" data-action="details">Details</a>
          <a class="btn btn-download" href="${app.download}" target="_blank" rel="noopener">Download</a>
        </div>
      </div>
    `;

    // Details click
    card.querySelector('[data-action="details"]').addEventListener('click', () => openModal(app));
    container.appendChild(card);
  });
}

// Modal
function openModal(app){
  const modal = document.getElementById('modal');
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <div style="display:flex;gap:16px">
      <div style="flex:0 0 110px">
        <img src="${app.image}" alt="${app.name}" style="width:100%; border-radius:12px;">
      </div>
      <div style="flex:1">
        <h2 style="margin-top:0">${app.name}</h2>
        <p style="margin:6px 0;color:#666">${app.description || ''}</p>
        <p style="margin:6px 0"><strong>Version:</strong> ${app.version || '-'} &nbsp; <strong>Größe:</strong> ${app.size || '-'}</p>
        <div style="margin-top:12px">
          <a class="btn btn-download" href="${app.download}" target="_blank" rel="noopener">APK herunterladen</a>
          ${app.github ? `<a class="btn btn-ghost" href="${app.github}" target="_blank" rel="noopener" style="margin-left:8px">GitHub</a>`: ''}
        </div>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
}

document.getElementById('modalClose').addEventListener('click', ()=> {
  document.getElementById('modal').classList.add('hidden');
});
document.getElementById('modal').addEventListener('click', (e)=>{
  if(e.target.id === 'modal') document.getElementById('modal').classList.add('hidden');
});

loadApps();
