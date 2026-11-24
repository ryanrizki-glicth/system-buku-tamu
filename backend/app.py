import os
import csv
import io
from flask import Flask, jsonify, request, send_from_directory, Response
from database import init_db, get_all_guests, get_guest_by_id, add_guest, delete_guest, get_stats

frontend_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
app = Flask(__name__, static_folder=frontend_folder, static_url_path='')

# Initialize DB on start
init_db()

# Enable CORS for all routes
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,DELETE,OPTIONS'
    return response

# Serve Frontend SPA
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

# REST API Endpoints
@app.route('/api/guests', methods=['GET', 'POST', 'OPTIONS'])
def handle_guests():
    if request.method == 'OPTIONS':
        return ('', 204)

    if request.method == 'GET':
        search = request.args.get('search', '').strip()
        category = request.args.get('category', '').strip()
        guests = get_all_guests(search=search if search else None, category=category if category else None)
        return jsonify({'status': 'success', 'data': guests, 'count': len(guests)})

    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form.to_dict()
        if not data:
            return jsonify({'status': 'error', 'message': 'Data permohonan tidak boleh kosong'}), 400

        name = data.get('name', '').strip()
        purpose = data.get('purpose', '').strip()

        if not name:
            return jsonify({'status': 'error', 'message': 'Nama lengkap wajib diisi'}), 400
        if not purpose:
            return jsonify({'status': 'error', 'message': 'Tujuan kunjungan wajib diisi'}), 400

        new_guest = add_guest(data)
        return jsonify({'status': 'success', 'message': 'Buku tamu berhasil disimpan', 'data': new_guest}), 201

@app.route('/api/guests/<int:guest_id>', methods=['GET', 'DELETE', 'OPTIONS'])
def handle_guest_detail(guest_id):
    if request.method == 'OPTIONS':
        return ('', 204)

    if request.method == 'GET':
        guest = get_guest_by_id(guest_id)
        if not guest:
            return jsonify({'status': 'error', 'message': 'Data tamu tidak ditemukan'}), 404
        return jsonify({'status': 'success', 'data': guest})

    if request.method == 'DELETE':
        success = delete_guest(guest_id)
        if not success:
            return jsonify({'status': 'error', 'message': 'Data tamu tidak ditemukan'}), 404
        return jsonify({'status': 'success', 'message': 'Data tamu berhasil dihapus'})

@app.route('/api/stats', methods=['GET'])
def handle_stats():
    stats = get_stats()
    return jsonify({'status': 'success', 'data': stats})

@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    guests = get_all_guests()
    si = io.StringIO()
    writer = csv.writer(si)
    writer.writerow(['ID', 'Nama', 'Instansi', 'Email', 'No Telepon', 'Kategori', 'Tujuan', 'Waktu Kunjungan'])
    
    for g in guests:
        writer.writerow([
            g['id'],
            g['name'],
            g['institution'],
            g.get('email', '-'),
            g.get('phone', '-'),
            g['category'],
            g['purpose'],
            g['created_at']
        ])
    
    output = si.getvalue()
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=data_buku_tamu.csv"}
    )

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Server Buku Tamu berjalan di http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
