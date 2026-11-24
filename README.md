# 📖 Sistem Buku Tamu Digital (Guestbook System v2.0)

Aplikasi manajemen dan pencatatan buku tamu berbasis web full-stack modern dengan **Backend REST API** dan antarmuka **Frontend Interaktif**.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/Python-3.x-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.x-black.svg)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20TailwindCSS%20%7C%20JS-38bdf8.svg)
![Database](https://img.shields.io/badge/Database-SQLite-003B57.svg)

---

## 🌟 Fitur Utama (Frontend & Backend)

### 🎨 Fitur Frontend Modern:
- **🌓 Dark Mode & Light Mode**: Dukungan tema gelap dan terang dengan deteksi preferensi sistem dan penyimpanan di `localStorage`.
- **✍️ Tanda Tangan Digital (Signature Pad)**: Kanvas HTML5 interaktif untuk membubuhkan tanda tangan langsung lewat mouse maupun layar sentuh (touchscreen/mobile).
- **📋 Modal Rincian Kunjungan (Detail View)**: Tampilan lengkap data tamu beserta tombol **Salin Email**, **Salin Telepon**, dan pintasan langsung ke **WhatsApp**.
- **🖨️ Cetak Slip Kunjungan (Printable Pass)**: Desain dokumen bukti tamu siap cetak (`@media print`) untuk kebutuhan resepsionis/keamanan fisik.
- **🏷️ Filter Pills & Pengurutan**: Tombol kategori cepat (Semua, Kedinasan, Bisnis, Studi Banding, Pribadi, Umum, dll) serta opsi pengurutan (Terbaru, Terlama, A-Z, Z-A).
- **🎨 Avatar Inisial Dinamis**: Avatar warna-warni berbasis kode hash nama pengunjung.
- **🗑️ Modal Konfirmasi Hapus**: Dialog konfirmasi kustom yang elegan menggantikan popup browser bawaan.
- **⌨️ Aksesibilitas Keyboard**: Tekan tombol `/` untuk langsung mencari tamu, dan tombol `Escape` untuk menutup modal.

### ⚙️ Fitur Backend & Database:
- **RESTful API**: Endpoint modular `/api/guests`, `/api/stats`, dan `/api/export/csv`.
- **Database SQLite**: Skema otomatis dengan migrasi kolom tanda tangan (`signature`) dan sorting.
- **Export CSV**: Rekapitulasi seluruh data kunjungan langsung ke file `.csv`.
- **Unit Testing Otomatis**: Dilengkapi unit test lengkap dengan tingkat kelulusan 100%.

---

## 📂 Struktur Project

```text
system-buku-tamu/
│
├── backend/
│   ├── app.py                # Server Flask & routing REST API
│   ├── database.py           # Operasi SQLite & query database
│   ├── requirements.txt      # Dependensi Python
│   └── tests/
│       └── test_api.py       # Unit & integration testing API
│
├── frontend/
│   ├── index.html            # Halaman utama aplikasi (SPA)
│   ├── css/
│   │   └── style.css         # Custom styling, dark mode & cetak slip
│   └── js/
│       └── app.js            # Interaktivitas, canvas signature, tema & AJAX
│
├── run.py                    # Script runner utama
├── .gitignore
└── README.md
```

---

## 🚀 Cara Menjalankan

### 1. Prasyarat
Pastikan Python 3 sudah terpasang di komputer Anda.

### 2. Install Dependensi
```bash
pip install -r backend/requirements.txt
```

### 3. Jalankan Aplikasi
Jalankan perintah berikut di terminal:
```bash
python3 run.py
```
atau dari folder backend:
```bash
python3 backend/app.py
```

### 4. Buka di Browser
Akses aplikasi melalui browser:
👉 **`http://localhost:5000`**

---

## 📡 Dokumentasi REST API

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/guests` | Mengambil daftar tamu (mendukung parameter `?search=`, `?category=`, dan `?sort_by=`) |
| `POST` | `/api/guests` | Menambahkan catatan tamu baru (JSON payload termasuk tanda tangan digital) |
| `GET` | `/api/guests/<id>` | Mengambil detail tamu berdasarkan ID |
| `DELETE` | `/api/guests/<id>` | Menghapus data tamu berdasarkan ID |
| `GET` | `/api/stats` | Statistik total tamu, tamu hari ini, dan per kategori |
| `GET` | `/api/export/csv` | Download berkas CSV seluruh data buku tamu |

---

## 🧪 Menjalankan Unit Testing

```bash
cd backend
python3 -m unittest discover -s tests
```

---

## 👤 Author & Lisensi
- GitHub: [ryanrizki-glicth](https://github.com/ryanrizki-glicth)
- Lisensi: MIT License
