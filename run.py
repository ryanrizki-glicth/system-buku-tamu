#!/usr/bin/env python3
"""
Launcher script untuk Sistem Buku Tamu Digital.
Menjalankan backend Flask yang sekaligus melayani frontend.
"""
import sys
import os

# Tambahkan direktori backend ke sys.path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("=" * 60)
    print("🚀 SISTEM BUKU TAMU DIGITAL TELAH BERJALAN")
    print(f"👉 Buka browser di: http://localhost:{port}")
    print("   - Frontend UI: http://localhost:5000")
    print("   - REST API:    http://localhost:5000/api/guests")
    print("=" * 60)
    app.run(host='0.0.0.0', port=port, debug=True)
