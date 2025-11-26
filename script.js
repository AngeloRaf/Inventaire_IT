
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

let items = [];

// URL de ton serveur (change le port si tu veux)
const API_URL = 'http://127.0.0.1:8000/api/items';

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  setTimeout(() => t.hidden = true, 2500);
}

function escapeHtml(s) {
  return (s || '').toString().replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[c]));
}

// === Chargement des items ===
async function loadItems() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erreur serveur');
    items = await res.json();
    render();
  } catch (err) {
    console.error(err);
    toast('Impossible de charger les données');
  }
}

// === Rendu du tableau avec recherche et tri ===
let currentSort = { column: null, direction: 'asc' };

function render() {
  const tbody = $('#tableBody');
  const searchTerm = $('#searchInput')?.value.toLowerCase().trim() || '';

  // Filtrage
  let filtered = items.filter(item => {
    const values = Object.values(item).join(' ').toLowerCase();
    return values.includes(searchTerm);
  });

  // Tri
  if (currentSort.column) {
    filtered.sort((a, b) => {
      let A = a[currentSort.column] || '';
      let B = b[currentSort.column] || '';
      if (typeof A === 'string') A = A.toLowerCase();
      if (typeof B === 'string') B = B.toLowerCase();
      if (A < B) return currentSort.direction === 'asc' ? -1 : 1;
      if (A > B) return currentSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  tbody.innerHTML = filtered.map(i => `
    <tr>
      <td>${escapeHtml(i.model || '')}</td>
      <td>${escapeHtml(i.name || '')}</td>
      <td>${escapeHtml(i.category || '')}</td>
      <td>${escapeHtml(i.status || '')}</td>
      <td>${escapeHtml(i.comment || '')}</td>
      <td>${escapeHtml(i.location || '')}</td>
      <td>${escapeHtml(i.assigned_to || '')}</td>
      <td>${i.purchase_date || ''}</td>
      <td>${i.warranty_end || ''}</td>
      <td>${i.quantity || 1}</td>
      <td>
        <button class="btn" data-action="edit" data-id="${i.id}">Éditer</button>
        <button class="btn" data-action="delete" data-id="${i.id}">Supprimer</button>
      </td>
    </tr>
  `).join('');

  // Réattacher les événements
  $$('#inventoryTable [data-action]').forEach(btn => {
    btn.onclick = e => {
      const id = e.target.dataset.id;
      const action = e.target.dataset.action;
      if (action === 'edit') editItem(id);
      if (action === 'delete') deleteItem(id);
    };
  });
}

// === CRUD API ===
async function createItem(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur création');
  const newItem = await res.json();
  items.push(newItem);
  render();
  toast('Ajouté avec succès !');
  closeModal();
}

async function updateItem(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erreur mise à jour');
  const updated = await res.json();
  const idx = items.findIndex(x => x.id === id);
  if (idx !== -1) items[idx] = updated;
  render();
  toast('Mis à jour !');
  closeModal();
}

async function deleteItem(id) {
  if (!confirm('Supprimer cet élément ?')) return;
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur suppression');
  items = items.filter(x => x.id !== id);
  render();
  toast('Supprimé');
}

// === Modal ===
function openModal(isAdd = true, item = null) {
  $('#modalOverlay').classList.add('visible');
  if (isAdd) {
    $('#modalTitle').textContent = 'Ajouter un élément';
    $('#itemForm').reset();
    $('#itemId').value = '';
    $('#quantity').value = 1;
  } else {
    $('#modalTitle').textContent = 'Éditer un élément';
    $('#itemId').value = item.id;
    $('#model').value = item.model || '';
    $('#name').value = item.name || '';
    $('#category').value = item.category || '';
    $('#status').value = item.status || '';
    $('#comment').value = item.comment || '';
    $('#location').value = item.location || '';
    $('#assignedTo').value = item.assigned_to || '';
    $('#purchaseDate').value = item.purchase_date || '';
    $('#warrantyEnd').value = item.warranty_end || '';
    $('#quantity').value = item.quantity || 1;
  }
  setTimeout(makeModalDraggable, 100); // petit délai pour être sûr que le modal est visible
}

function closeModal() {
  $('#modalOverlay').classList.remove('visible');
}

// === MODAL DRAGGABLE ===
function makeModalDraggable() {
  const modal = $('.modal');
  const header = $('.modal-header');
  if (!modal || !header) return;

  let posX = 0, posY = 0, initialX = 0, initialY = 0;

  header.onmousedown = dragStart;
  header.ontouchstart = dragStart; // pour mobile aussi

  function dragStart(e) {
    e = e || window.event;
    e.preventDefault();

    initialX = e.clientX || e.touches[0].clientX;
    initialY = e.clientY || e.touches[0].clientY;

    posX = modal.offsetLeft;
    posY = modal.offsetTop;

    document.onmouseup = stopDrag;
    document.onmousemove = dragMove;
    document.ontouchend = stopDrag;
    document.ontouchmove = dragMove;
  }

  function dragMove(e) {
    e = e || window.event;
    e.preventDefault();

    const currentX = (e.clientX || e.touches[0].clientX) - initialX;
    const currentY = (e.clientY || e.touches[0].clientY) - initialY;

    modal.style.left = (posX + currentX) + 'px';
    modal.style.top = (posY + currentY) + 'px';
    modal.style.transform = 'none'; // on désactive le centrage
  }

  function stopDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

function editItem(id) {
  const item = items.find(x => x.id === id);
  if (item) openModal(false, item);
}

// === EXPORT CSV ===
function exportCSV() {
  if (items.length === 0) return toast('Aucun élément à exporter');

  const headers = ['model','name','category','status','comment','location','assigned_to','purchase_date','warranty_end','quantity'];
  const csvLines = [
    headers.join(','),  // entête
    ...items.map(i => headers.map(h => `"${(i[h] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvLines], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventaire_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  toast('Export CSV terminé !');
}

// === DÉCONNEXION ===
function logout() {
  if (confirm('Se déconnecter ?')) {
    localStorage.removeItem('authUser');
    window.location.href = 'login.html';
  }
}

// === INIT ===
document.addEventListener('DOMContentLoaded', async () => {
  // Auth guard
  if (!localStorage.getItem('authUser')) {
    window.location.href = 'login.html';
    return;
  }

  await loadItems();

  // Boutons principaux
  $('#btnAdd')?.addEventListener('click', () => openModal(true));
  $('#btnExport')?.addEventListener('click', exportCSV);
  $('#btnLogout')?.addEventListener('click', logout);

  // Import CSV (optionnel, tu peux le compléter plus tard)
  $('#inputImport')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      toast('Import CSV bientôt disponible');
      e.target.value = '';
    }
  });

  // === FERMETURE MODAL (X, Annuler, clic dehors, Échap) ===
  $('#modalClose')?.addEventListener('click', closeModal);
  $('#btnCancel')?.addEventListener('click', closeModal);
  $('#modalOverlay')?.addEventListener('click', e => {
    if (e.target === $('#modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Soumission du formulaire
  $('#itemForm')?.addEventListener('submit', async e => {
    e.preventDefault();

    const data = {
      model: $('#model').value.trim() || null,
      name: $('#name').value.trim(),
      category: $('#category').value.trim(),
      status: $('#status').value.trim(),
      comment: $('#comment').value.trim() || null,
      location: $('#location').value.trim() || null,
      assignedTo: $('#assignedTo').value.trim() || null,
      purchaseDate: $('#purchaseDate').value || null,
      warrantyEnd: $('#warrantyEnd').value || null,
      quantity: parseInt($('#quantity').value) || 1
    };

    if (!data.name || !data.category || !data.status) {
      toast('Nom, catégorie et état sont obligatoires');
      return;
    }

    const id = $('#itemId').value;
    if (id) await updateItem(id, data);
    else await createItem(data);
  });

    // === RECHERCHE EN TEMPS RÉEL ===
  $('#searchInput')?.addEventListener('input', () => render());
  $('#btnClearSearch')?.addEventListener('click', () => {
    $('#searchInput').value = '';
    render();
  });

  // === TRI PAR COLONNE ===
  document.querySelectorAll('th').forEach((th, index) => {
    const columns = ['model', 'name', 'category', 'status', 'comment', 'location', 'assigned_to', 'purchase_date', 'warranty_end', 'quantity'];
    if (index >= columns.length) return;

    th.classList.add('sortable');
    th.onclick = () => {
      const col = columns[index];
      if (currentSort.column === col) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.column = col;
        currentSort.direction = 'asc';
      }
      document.querySelectorAll('th').forEach(t => t.classList.remove('asc', 'desc'));
      th.classList.add(currentSort.direction);
      render();
    };
  });
});