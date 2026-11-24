// Sistem Buku Tamu Digital - Frontend JavaScript

const API_BASE = '/api';

// Elements
const guestTableBody = document.getElementById('guestTableBody');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const btnRefresh = document.getElementById('btnRefresh');

const guestModal = document.getElementById('guestModal');
const btnOpenModal = document.getElementById('btnOpenModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelModal = document.getElementById('btnCancelModal');
const btnEmptyAdd = document.getElementById('btnEmptyAdd');
const guestForm = document.getElementById('guestForm');
const btnSubmitGuest = document.getElementById('btnSubmitGuest');

// Stats Elements
const statTotal = document.getElementById('statTotal');
const statToday = document.getElementById('statToday');
const statOfficial = document.getElementById('statOfficial');
const statGeneral = document.getElementById('statGeneral');

let searchDebounceTimeout = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchGuests();
  fetchStats();
  setupEventListeners();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

function setupEventListeners() {
  // Modal controls
  btnOpenModal.addEventListener('click', openModal);
  if (btnEmptyAdd) btnEmptyAdd.addEventListener('click', openModal);
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  // Close modal when clicking outside
  guestModal.addEventListener('click', (e) => {
    if (e.target === guestModal) closeModal();
  });

  // Submit form
  guestForm.addEventListener('submit', handleFormSubmit);

  // Search input debounced
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
      fetchGuests();
    }, 300);
  });

  // Category filter
  categoryFilter.addEventListener('change', () => {
    fetchGuests();
  });

  // Refresh
  btnRefresh.addEventListener('click', () => {
    fetchGuests();
    fetchStats();
    showToast('Data diperbarui', 'info');
  });
}

function openModal() {
  guestModal.classList.remove('hidden');
  guestModal.classList.add('flex');
  if (window.lucide) window.lucide.createIcons();
}

function closeModal() {
  guestModal.classList.add('hidden');
  guestModal.classList.remove('flex');
  guestForm.reset();
}

// Fetch Guests
async function fetchGuests() {
  setLoading(true);
  try {
    const search = encodeURIComponent(searchInput.value.trim());
    const category = encodeURIComponent(categoryFilter.value);
    
    let url = `${API_BASE}/guests?`;
    if (search) url += `search=${search}&`;
    if (category && category !== 'Semua') url += `category=${category}`;

    const res = await fetch(url);
    const json = await res.json();

    if (json.status === 'success') {
      renderGuests(json.data);
    } else {
      showToast(json.message || 'Gagal memuat data', 'error');
    }
  } catch (err) {
    console.error('Fetch guests error:', err);
    showToast('Terjadi kesalahan jaringan saat memuat tamu', 'error');
  } finally {
    setLoading(false);
  }
}

// Fetch Statistics
async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const json = await res.json();
    if (json.status === 'success') {
      const stats = json.data;
      statTotal.textContent = stats.total || 0;
      statToday.textContent = stats.today || 0;

      const cats = stats.categories || {};
      const officialCount = (cats['Kedinasan'] || 0) + (cats['Bisnis'] || 0);
      const generalCount = (cats['Umum'] || 0) + (cats['Pribadi'] || 0) + (cats['Lainnya'] || 0);

      statOfficial.textContent = officialCount;
      statGeneral.textContent = generalCount;
    }
  } catch (err) {
    console.error('Fetch stats error:', err);
  }
}

// Render Table
function renderGuests(guests) {
  guestTableBody.innerHTML = '';

  if (!guests || guests.length === 0) {
    emptyState.classList.remove('hidden');
    guestTableBody.parentElement.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  guestTableBody.parentElement.classList.remove('hidden');

  guests.forEach((guest) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50/80 transition-colors fade-in';

    // Format date
    const dateObj = new Date(guest.created_at);
    const formattedDate = isNaN(dateObj.getTime())
      ? guest.created_at
      : dateObj.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

    // Badge styling
    const badgeClass = getBadgeClass(guest.category);

    tr.innerHTML = `
      <td class="py-3.5 px-4 sm:px-6 whitespace-nowrap text-xs text-slate-500 font-mono">
        ${formattedDate}
      </td>
      <td class="py-3.5 px-4 sm:px-6">
        <div class="font-semibold text-slate-900">${escapeHtml(guest.name)}</div>
        <div class="text-xs text-slate-500">${escapeHtml(guest.institution || '-')}</div>
      </td>
      <td class="py-3.5 px-4 sm:px-6">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">
          ${escapeHtml(guest.category)}
        </span>
      </td>
      <td class="py-3.5 px-4 sm:px-6 max-w-xs truncate text-slate-700" title="${escapeHtml(guest.purpose)}">
        ${escapeHtml(guest.purpose)}
      </td>
      <td class="py-3.5 px-4 sm:px-6 text-xs text-slate-500">
        <div>${guest.phone ? `<span class="inline-flex items-center gap-1"><i data-lucide="phone" class="w-3 h-3 text-slate-400"></i> ${escapeHtml(guest.phone)}</span>` : '-'}</div>
        <div>${guest.email ? `<span class="inline-flex items-center gap-1"><i data-lucide="mail" class="w-3 h-3 text-slate-400"></i> ${escapeHtml(guest.email)}</span>` : ''}</div>
      </td>
      <td class="py-3.5 px-4 sm:px-6 text-center">
        <button 
          onclick="deleteGuestItem(${guest.id}, '${escapeHtml(guest.name)}')" 
          class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          title="Hapus data tamu"
        >
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    guestTableBody.appendChild(tr);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Badge class helper
function getBadgeClass(category) {
  switch (category) {
    case 'Kedinasan': return 'badge-kedinasan';
    case 'Bisnis': return 'badge-bisnis';
    case 'Studi Banding': return 'badge-studi-banding';
    case 'Pribadi': return 'badge-pribadi';
    case 'Lainnya': return 'badge-lainnya';
    default: return 'badge-umum';
  }
}

// Handle Form Submission
async function handleFormSubmit(e) {
  e.preventDefault();
  btnSubmitGuest.disabled = true;
  btnSubmitGuest.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Menyimpan...`;

  const formData = new FormData(guestForm);
  const payload = {
    name: formData.get('name'),
    institution: formData.get('institution'),
    category: formData.get('category'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    purpose: formData.get('purpose'),
  };

  try {
    const res = await fetch(`${API_BASE}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (res.ok && json.status === 'success') {
      showToast('Data tamu berhasil ditambahkan!', 'success');
      closeModal();
      fetchGuests();
      fetchStats();
    } else {
      showToast(json.message || 'Gagal menyimpan data tamu', 'error');
    }
  } catch (err) {
    console.error('Submit error:', err);
    showToast('Terjadi kesalahan koneksi', 'error');
  } finally {
    btnSubmitGuest.disabled = false;
    btnSubmitGuest.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> <span>Simpan Catatan</span>`;
    if (window.lucide) window.lucide.createIcons();
  }
}

// Delete Guest
async function deleteGuestItem(id, name) {
  if (!confirm(`Apakah Anda yakin ingin menghapus catatan kunjungan dari "${name}"?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/guests/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();

    if (res.ok && json.status === 'success') {
      showToast(`Data "${name}" berhasil dihapus`, 'success');
      fetchGuests();
      fetchStats();
    } else {
      showToast(json.message || 'Gagal menghapus data', 'error');
    }
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Terjadi kesalahan saat menghapus', 'error');
  }
}

// Loading UI helper
function setLoading(isLoading) {
  if (isLoading) {
    loadingState.classList.remove('hidden');
    loadingState.classList.add('flex');
    emptyState.classList.add('hidden');
  } else {
    loadingState.classList.add('hidden');
    loadingState.classList.remove('flex');
  }
  if (window.lucide) window.lucide.createIcons();
}

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  let bg = 'bg-slate-900 text-white';
  let icon = 'info';
  if (type === 'success') {
    bg = 'bg-emerald-600 text-white shadow-emerald-200';
    icon = 'check-circle-2';
  } else if (type === 'error') {
    bg = 'bg-rose-600 text-white shadow-rose-200';
    icon = 'alert-circle';
  }

  toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all transform duration-300 translate-y-2 opacity-0 ${bg}`;
  toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i> <span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  // Animate out & remove
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Security: Escape HTML helper
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
