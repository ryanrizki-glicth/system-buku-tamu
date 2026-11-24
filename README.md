# 📖 Sistem Buku Tamu Digital (Guestbook System)

Aplikasi manajemen dan pencatatan buku tamu berbasis web full-stack modern dengan **Backend REST API** dan antarmuka **Frontend Interaktif**.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/Python-3.x-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.x-black.svg)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20TailwindCSS%20%7C%20JS-38bdf8.svg)
![Database](https://img.shields.io/badge/Database-SQLite-003B57.svg)

---

## 🌟 Fitur Utama

- **Pencatatan Tamu Real-time**: Formulir modal interaktif untuk mencatat nama, instansi, kategori kunjungan, email, nomor kontak, dan keperluan.
- **Statistik & Ringkasan Cepat**: Kartu indikator total kunjungan, kunjungan hari ini, kunjungan kedinasan/bisnis, dan kategori umum.
- **Pencarian & Filter Cepat**: Filter berdasarkan nama, instansi, keperluan, serta kategori kunjungan (Kedinasan, Bisnis, Studi Banding, Pribadi, Umum, dll).
- **Export Data ke CSV**: Unduh rekapitulasi buku tamu langsung dalam format spreadsheet `.csv`.
- **Manajemen Data**: Hapus data tamu langsung dari antarmuka dengan konfirmasi keamanan.
- **Desain Modern & Responsif**: Antarmuka bersih menggunakan Tailwind CSS dengan dukungan tampilan mobile, tablet, dan desktop.
- **Arsitektur REST API**: Backend decoupled yang dapat dengan mudah diintegrasikan dengan aplikasi lain atau mobile app.

---

## 📂 Struktur Project

```text
system-buku-tamu/
│
├── backend/
│   ├── app.py                # Server Flask & routing REST API
│   ├── database.py           # Operasi SQLite & manajemen query
│   ├── requirements.txt      # Dependensi Python
│   └── tests/
│       └── test_api.py       # Unit & integration testing API
│
├── frontend/
│   ├── index.html            # Halaman utama aplikasi (SPA)
│   ├── css/
│   │   └── style.css         # Custom style & animasi badge
│   └── js/
│       └── app.js            # Logika AJAX/Fetch API & interaktivitas
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
| `GET` | `/api/guests` | Mengambil seluruh daftar tamu (mendukung parameter `?search=` & `?category=`) |
| `POST` | `/api/guests` | Menambahkan catatan tamu baru (JSON payload) |
| `GET` | `/api/guests/<id>` | Mengambil detail tamu berdasarkan ID |
| `DELETE` | `/api/guests/<id>` | Menghapus data tamu berdasarkan ID |
| `GET` | `/api/stats` | Statistik total tamu, tamu hari ini, dan per kategori |
| `GET` | `/api/export/csv` | Download berkas CSV seluruh data buku tamu |

### Contoh Request Tambah Tamu (POST `/api/guests`):
```json
{
  "name": "Budi Santoso",
  "institution": "Universitas Indonesia",
  "category": "Kedinasan",
  "email": "budi@ui.ac.id",
  "phone": "081234567890",
  "purpose": "Konsultasi kerja sama riset AI"
}
```

---

## 🧪 Menjalankan Unit Testing

Proyek ini telah dilengkapi dengan unit test otomatis untuk memastikan seluruh endpoint API bekerja dengan baik:

```bash
cd backend
python3 -m unittest discover -s tests
```

---

## 👤 Author & Lisensi
- GitHub: [ryanrizki-glicth](https://github.com/ryanrizki-glicth)
- Lisensi: MIT License
