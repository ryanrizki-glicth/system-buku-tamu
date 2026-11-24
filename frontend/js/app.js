// Sistem Buku Tamu Digital - Frontend JavaScript (v2.0)

const API_BASE = '/api';

// State
let allGuests = [];
let currentCategory = 'Semua';
let currentSearch = '';
let currentSort = 'newest';
let guestToDelete = null;
let currentDetailGuest = null;
let searchDebounceTimeout = null;

// DOM Elements
const guestTableBody = document.getElementById('guestTableBody');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const sortFilter = document.getElementById('sortFilter');
const btnRefresh = document.getElementById('btnRefresh');
const guestCountLabel = document.getElementById('guestCountLabel');

// Theme Elements
const btnThemeToggle = document.getElementById('btnThemeToggle');
const themeIcon = document.getElementById('themeIcon');

// Guest Form Modal
const guestModal = document.getElementById('guestModal');
const btnOpenModal = document.getElementById('btnOpenModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelModal = document.getElementById('btnCancelModal');
const btnEmptyAdd = document.getElementById('btnEmptyAdd');
const guestForm = document.getElementById('guestForm');
const btnSubmitGuest = document.getElementById('btnSubmitGuest');

// Signature Canvas
const signatureCanvas = document.getElementById('signatureCanvas');
const btnClearSignature = document.getElementById('btnClearSignature');
const signaturePlaceholder = document.getElementById('signaturePlaceholder');
let canvasCtx = null;
let isDrawing = false;
let hasDrawnSignature = false;

// Detail Modal
const detailModal = document.getElementById('detailModal');
const detailContent = document.getElementById('detailContent');
const btnCloseDetailModal = document.getElementById('btnCloseDetailModal');
const btnCloseDetailBtn = document.getElementById('btnCloseDetailBtn');
const btnPrintSlip = document.getElementById('btnPrintSlip');

// Delete Modal
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const deleteTargetName = document.getElementById('deleteTargetName');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');

// Category Pills
const categoryPills = document.getElementById('categoryPills');

// Stats Elements
const statTotal = document.getElementById('statTotal');
const statToday = document.getElementById('statToday');
const statOfficial = document.getElementById('statOfficial');
const statGeneral = document.getElementById('statGeneral');

// Printable Area
const printableSlip = document.getElementById('printableSlip');

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSignaturePad();
  setupEventListeners();
  fetchGuests();
  fetchStats();
  if (window.lucide) window.lucide.createIcons();
});

// ----------------- THEME MANAGEMENT -----------------
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeIcon();

  btnThemeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
    // Redraw signature if canvas has content
    if (signatureCanvas && isDark) initCanvasStrokeStyle();
  });
}

function updateThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
  if (window.lucide) window.lucide.createIcons();
}

// ----------------- SIGNATURE PAD -----------------
function initSignaturePad() {
  if (!signatureCanvas) return;
  canvasCtx = signatureCanvas.getContext('2d');

  function resizeCanvas() {
    const rect = signatureCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    signatureCanvas.width = rect.width * dpr;
    signatureCanvas.height = rect.height * dpr;
    canvasCtx.scale(dpr, dpr);
    initCanvasStrokeStyle();
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function getPos(e) {
    const rect = signatureCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    isDrawing = true;
    hasDrawnSignature = true;
    if (signaturePlaceholder) signaturePlaceholder.classList.add('hidden');
    const pos = getPos(e);
    canvasCtx.beginPath();
    canvasCtx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    canvasCtx.lineTo(pos.x, pos.y);
    canvasCtx.stroke();
  }

  function stopDrawing() {
    if (isDrawing) {
      canvasCtx.closePath();
      isDrawing = false;
    }
  }

  // Pointer & Touch Events
  signatureCanvas.addEventListener('mousedown', startDrawing);
  signatureCanvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDrawing);

  signatureCanvas.addEventListener('touchstart', startDrawing, { passive: false });
  signatureCanvas.addEventListener('touchmove', draw, { passive: false });
  window.addEventListener('touchend', stopDrawing);

  btnClearSignature.addEventListener('click', clearSignature);
}

function initCanvasStrokeStyle() {
  if (!canvasCtx) return;
  const isDark = document.documentElement.classList.contains('dark');
  canvasCtx.strokeStyle = isDark ? '#e2e8f0' : '#1e293b';
  canvasCtx.lineWidth = 2.5;
  canvasCtx.lineCap = 'round';
  canvasCtx.lineJoin = 'round';
}

function clearSignature() {
  if (!canvasCtx || !signatureCanvas) return;
  const rect = signatureCanvas.getBoundingClientRect();
  canvasCtx.clearRect(0, 0, rect.width, rect.height);
  hasDrawnSignature = false;
  if (signaturePlaceholder) signaturePlaceholder.classList.remove('hidden');
}

function getSignatureData() {
  if (!hasDrawnSignature || !signatureCanvas) return '';
  return signatureCanvas.toDataURL('image/png');
}

// ----------------- EVENT LISTENERS -----------------
function setupEventListeners() {
  // Modal toggles
  btnOpenModal.addEventListener('click', openModal);
  if (btnEmptyAdd) btnEmptyAdd.addEventListener('click', openModal);
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  guestModal.addEventListener('click', (e) => {
    if (e.target === guestModal) closeModal();
  });

  // Detail Modal toggles
  btnCloseDetailModal.addEventListener('click', closeDetailModal);
  btnCloseDetailBtn.addEventListener('click', closeDetailModal);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeDetailModal();
  });

  // Delete Modal toggles
  btnCancelDelete.addEventListener('click', closeDeleteModal);
  btnConfirmDelete.addEventListener('click', executeDelete);
  deleteConfirmModal.addEventListener('click', (e) => {
    if (e.target === deleteConfirmModal) closeDeleteModal();
  });

  // Print Slip
  btnPrintSlip.addEventListener('click', printCurrentVisitorSlip);

  // Form submit
  guestForm.addEventListener('submit', handleFormSubmit);

  // Search input debounced
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
      currentSearch = searchInput.value.trim();
      fetchGuests();
    }, 280);
  });

  // Sorting
  sortFilter.addEventListener('change', () => {
    currentSort = sortFilter.value;
    fetchGuests();
  });

  // Category Pills
  categoryPills.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill-btn');
    if (!btn) return;

    document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentCategory = btn.dataset.cat || 'Semua';
    fetchGuests();
  });

  // Refresh button
  btnRefresh.addEventListener('click', () => {
    fetchGuests();
    fetchStats();
    showToast('Data diperbarui', 'info');
  });

  // Keyboard Shortcuts: '/' to focus search, 'Escape' to close modals
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && !isAnyModalOpen()) {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'Escape') {
      if (!guestModal.classList.contains('hidden')) closeModal();
      if (!detailModal.classList.contains('hidden')) closeDetailModal();
      if (!deleteConfirmModal.classList.contains('hidden')) closeDeleteModal();
    }
  });
}

function isAnyModalOpen() {
  return !guestModal.classList.contains('hidden') || 
         !detailModal.classList.contains('hidden') || 
         !deleteConfirmModal.classList.contains('hidden');
}

// ----------------- MODAL CONTROLS -----------------
function openModal() {
  guestModal.classList.remove('hidden');
  guestModal.classList.add('flex');
  clearSignature();
  initCanvasStrokeStyle();
  if (window.lucide) window.lucide.createIcons();
}

function closeModal() {
  guestModal.classList.add('hidden');
  guestModal.classList.remove('flex');
  guestForm.reset();
  clearSignature();
}

function openDetailModal(guest) {
  currentDetailGuest = guest;
  renderDetailContent(guest);
  detailModal.classList.remove('hidden');
  detailModal.classList.add('flex');
  if (window.lucide) window.lucide.createIcons();
}

function closeDetailModal() {
  detailModal.classList.add('hidden');
  detailModal.classList.remove('flex');
  currentDetailGuest = null;
}

function openDeleteModal(guestId, guestName) {
  guestToDelete = { id: guestId, name: guestName };
  deleteTargetName.textContent = `"${guestName}"`;
  deleteConfirmModal.classList.remove('hidden');
  deleteConfirmModal.classList.add('flex');
  if (window.lucide) window.lucide.createIcons();
}

function closeDeleteModal() {
  deleteConfirmModal.classList.add('hidden');
  deleteConfirmModal.classList.remove('flex');
  guestToDelete = null;
}

// ----------------- DATA FETCHING -----------------
async function fetchGuests() {
  setLoading(true);
  try {
    const search = encodeURIComponent(currentSearch);
    const category = encodeURIComponent(currentCategory);
    const sort = encodeURIComponent(currentSort);

    let url = `${API_BASE}/guests?sort_by=${sort}&`;
    if (search) url += `search=${search}&`;
    if (category && category !== 'Semua') url += `category=${category}`;

    const res = await fetch(url);
    const json = await res.json();

    if (json.status === 'success') {
      allGuests = json.data || [];
      renderGuests(allGuests);
      guestCountLabel.textContent = `Menampilkan ${allGuests.length} tamu`;
    } else {
      showToast(json.message || 'Gagal memuat data', 'error');
    }
  } catch (err) {
    console.error('Fetch guests error:', err);
    showToast('Terjadi kesalahan koneksi saat memuat data tamu', 'error');
  } finally {
    setLoading(false);
  }
}

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

// ----------------- TABLE RENDERING -----------------
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
    tr.className = 'hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors fade-in cursor-pointer';

    const formattedDate = formatDate(guest.created_at);
    const badgeClass = getBadgeClass(guest.category);
    const avatar = createAvatarHTML(guest.name);

    tr.innerHTML = `
      <td class="py-3.5 px-4 sm:px-6 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono">
        ${formattedDate}
      </td>
      <td class="py-3.5 px-4 sm:px-6">
        <div class="flex items-center gap-3">
          ${avatar}
          <div>
            <div class="font-semibold text-slate-900 dark:text-white">${escapeHtml(guest.name)}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(guest.institution || '-')}</div>
          </div>
        </div>
      </td>
      <td class="py-3.5 px-4 sm:px-6">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">
          ${escapeHtml(guest.category)}
        </span>
      </td>
      <td class="py-3.5 px-4 sm:px-6 max-w-xs truncate text-slate-700 dark:text-slate-300" title="${escapeHtml(guest.purpose)}">
        ${escapeHtml(guest.purpose)}
      </td>
      <td class="py-3.5 px-4 sm:px-6 text-xs text-slate-500 dark:text-slate-400">
        <div>${guest.phone ? `<span class="inline-flex items-center gap-1"><i data-lucide="phone" class="w-3 h-3 text-slate-400"></i> ${escapeHtml(guest.phone)}</span>` : '-'}</div>
        <div>${guest.email ? `<span class="inline-flex items-center gap-1"><i data-lucide="mail" class="w-3 h-3 text-slate-400"></i> ${escapeHtml(guest.email)}</span>` : ''}</div>
      </td>
      <td class="py-3.5 px-4 sm:px-6 text-center whitespace-nowrap" onclick="event.stopPropagation();">
        <div class="inline-flex items-center gap-1">
          <button 
            onclick="viewGuestDetail(${guest.id})" 
            class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition"
            title="Lihat Rincian"
          >
            <i data-lucide="eye" class="w-4 h-4"></i>
          </button>
          <button 
            onclick="promptDelete(${guest.id}, '${escapeHtml(guest.name)}')" 
            class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg transition"
            title="Hapus data tamu"
          >
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    `;

    // Row click opens detail
    tr.addEventListener('click', () => {
      openDetailModal(guest);
    });

    guestTableBody.appendChild(tr);
  });

  if (window.lucide) window.lucide.createIcons();
}

// Avatar Generator
function createAvatarHTML(name) {
  const initials = getInitials(name);
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-purple-500 to-violet-600',
    'from-cyan-500 to-blue-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];

  return `
    <div class="w-9 h-9 rounded-xl bg-gradient-to-br ${color} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
      ${initials}
    </div>
  `;
}

function getInitials(name) {
  if (!name) return 'TM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ----------------- DETAIL MODAL RENDERING -----------------
function viewGuestDetail(id) {
  const guest = allGuests.find(g => g.id === id);
  if (guest) openDetailModal(guest);
}

function renderDetailContent(guest) {
  const formattedDate = formatDate(guest.created_at);
  const badgeClass = getBadgeClass(guest.category);
  const avatar = createAvatarHTML(guest.name);

  const cleanPhone = guest.phone ? guest.phone.replace(/[^0-9]/g, '') : '';
  const waUrl = cleanPhone ? (cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone) : '';

  detailContent.innerHTML = `
    <div class="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-700">
      ${avatar}
      <div>
        <h3 class="text-base font-bold text-slate-900 dark:text-white leading-tight">${escapeHtml(guest.name)}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(guest.institution || 'Pribadi / Umum')}</p>
      </div>
      <div class="ml-auto">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">
          ${escapeHtml(guest.category)}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 text-xs">
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
        <span class="text-slate-400 block font-medium mb-0.5">Waktu Kunjungan</span>
        <span class="font-semibold text-slate-800 dark:text-slate-200">${formattedDate}</span>
      </div>
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
        <span class="text-slate-400 block font-medium mb-0.5">ID Catatan</span>
        <span class="font-mono font-semibold text-indigo-600 dark:text-indigo-400">#GST-${guest.id}</span>
      </div>
    </div>

    <!-- Contact Info -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Kontak Tamu</h4>
      <div class="flex flex-col gap-1.5 text-xs">
        <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
          <span class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <i data-lucide="mail" class="w-3.5 h-3.5 text-slate-400"></i> ${escapeHtml(guest.email || 'Tidak dicantumkan')}
          </span>
          ${guest.email ? `<button onclick="copyToClipboard('${escapeHtml(guest.email)}', 'Email disalin!')" class="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-medium">Salin</button>` : ''}
        </div>
        <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60">
          <span class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <i data-lucide="phone" class="w-3.5 h-3.5 text-slate-400"></i> ${escapeHtml(guest.phone || 'Tidak dicantumkan')}
          </span>
          <div class="flex items-center gap-2 text-[11px]">
            ${guest.phone ? `<button onclick="copyToClipboard('${escapeHtml(guest.phone)}', 'No. HP disalin!')" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Salin</button>` : ''}
            ${waUrl ? `<a href="https://wa.me/${waUrl}" target="_blank" rel="noopener" class="text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-0.5">WhatsApp &rarr;</a>` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- Purpose -->
    <div>
      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tujuan / Keperluan Kunjungan</h4>
      <p class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs leading-relaxed">
        ${escapeHtml(guest.purpose)}
      </p>
    </div>

    <!-- Signature Preview if available -->
    ${guest.signature ? `
      <div>
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tanda Tangan Digital</h4>
        <div class="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 inline-block">
          <img src="${guest.signature}" alt="Tanda Tangan Tamu" class="h-16 w-auto object-contain dark:invert" />
        </div>
      </div>
    ` : ''}
  `;

  if (window.lucide) window.lucide.createIcons();
}

// ----------------- PRINT VISITOR SLIP -----------------
function printCurrentVisitorSlip() {
  if (!currentDetailGuest) return;
  const guest = currentDetailGuest;
  const formattedDate = formatDate(guest.created_at);

  printableSlip.innerHTML = `
    <div style="max-width: 650px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 12px; padding: 24px; font-family: sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
        <div>
          <h2 style="font-size: 20px; font-weight: bold; margin: 0; text-transform: uppercase;">SLIP KUNJUNGAN BUKU TAMU</h2>
          <p style="font-size: 11px; color: #475569; margin: 4px 0 0 0;">Sistem Buku Tamu Digital &bull; Dokumen Kunjungan Resmi</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 14px; font-weight: bold; color: #4f46e5; border: 1px solid #4f46e5; padding: 4px 10px; border-radius: 6px;">
            PASS #${guest.id}
          </span>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 6px 0; width: 140px; font-weight: bold; color: #475569;">Nama Lengkap</td>
          <td style="padding: 6px 0; font-weight: bold; font-size: 15px;">: ${escapeHtml(guest.name)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #475569;">Instansi</td>
          <td style="padding: 6px 0;">: ${escapeHtml(guest.institution || 'Pribadi / Umum')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #475569;">Kategori Kunjungan</td>
          <td style="padding: 6px 0;">: ${escapeHtml(guest.category)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #475569;">Waktu Kunjungan</td>
          <td style="padding: 6px 0;">: ${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #475569;">Kontak</td>
          <td style="padding: 6px 0;">: ${escapeHtml(guest.phone || '-')} / ${escapeHtml(guest.email || '-')}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #475569; vertical-align: top;">Keperluan</td>
          <td style="padding: 6px 0; vertical-align: top;">: ${escapeHtml(guest.purpose)}</td>
        </tr>
      </table>

      <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; text-align: center;">
        <div style="width: 200px;">
          <p style="font-size: 12px; margin-bottom: 50px;">Petugas Resepsionis</p>
          <div style="border-top: 1px solid #94a3b8; font-size: 12px; padding-top: 4px;">(...........................)</div>
        </div>
        <div style="width: 200px;">
          <p style="font-size: 12px; margin-bottom: 8px;">Tamu Kunjungan</p>
          ${guest.signature ? `<img src="${guest.signature}" style="height: 40px; margin-bottom: 2px;" alt="TTD"/>` : `<div style="height: 42px;"></div>`}
          <div style="border-top: 1px solid #94a3b8; font-size: 12px; padding-top: 4px;">${escapeHtml(guest.name)}</div>
        </div>
      </div>
    </div>
  `;

  window.print();
}

// ----------------- FORM SUBMISSION -----------------
async function handleFormSubmit(e) {
  e.preventDefault();
  btnSubmitGuest.disabled = true;
  btnSubmitGuest.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Menyimpan...`;

  const formData = new FormData(guestForm);
  const signatureData = getSignatureData();

  const payload = {
    name: formData.get('name'),
    institution: formData.get('institution'),
    category: formData.get('category'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    purpose: formData.get('purpose'),
    signature: signatureData
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
    showToast('Terjadi kesalahan koneksi saat mengirim formulir', 'error');
  } finally {
    btnSubmitGuest.disabled = false;
    btnSubmitGuest.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> <span>Simpan Catatan</span>`;
    if (window.lucide) window.lucide.createIcons();
  }
}

// ----------------- DELETE ACTION -----------------
function promptDelete(id, name) {
  openDeleteModal(id, name);
}

async function executeDelete() {
  if (!guestToDelete) return;
  const { id, name } = guestToDelete;

  btnConfirmDelete.disabled = true;
  btnConfirmDelete.textContent = 'Menghapus...';

  try {
    const res = await fetch(`${API_BASE}/guests/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();

    if (res.ok && json.status === 'success') {
      showToast(`Data "${name}" berhasil dihapus`, 'success');
      closeDeleteModal();
      fetchGuests();
      fetchStats();
    } else {
      showToast(json.message || 'Gagal menghapus data', 'error');
    }
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Terjadi kesalahan saat menghapus', 'error');
  } finally {
    btnConfirmDelete.disabled = false;
    btnConfirmDelete.textContent = 'Ya, Hapus';
  }
}

// ----------------- HELPERS -----------------
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

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  let bg = 'bg-slate-900 text-white';
  let icon = 'info';
  if (type === 'success') {
    bg = 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none';
    icon = 'check-circle-2';
  } else if (type === 'error') {
    bg = 'bg-rose-600 text-white shadow-rose-200 dark:shadow-none';
    icon = 'alert-circle';
  }

  toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium shadow-lg transition-all transform duration-300 translate-y-2 opacity-0 ${bg}`;
  toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i> <span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg, 'success');
  }).catch(() => {
    showToast('Gagal menyalin teks', 'error');
  });
}

function formatDate(dateStr) {
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  return dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

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

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
