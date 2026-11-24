import sqlite3
import os
from datetime import datetime

DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), 'buku_tamu.db')

def get_connection(db_path=None):
    if db_path is None:
        db_path = DEFAULT_DB_PATH
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path=None):
    if db_path is None:
        db_path = DEFAULT_DB_PATH
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS guests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            institution TEXT,
            purpose TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'Umum',
            signature TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()

    # Migration check for existing DB without signature column
    cursor.execute("PRAGMA table_info(guests)")
    columns = [col['name'] for col in cursor.fetchall()]
    if 'signature' not in columns:
        cursor.execute("ALTER TABLE guests ADD COLUMN signature TEXT")
        conn.commit()

    conn.close()

def get_all_guests(search=None, category=None, sort_by='newest', db_path=None):
    if db_path is None:
        db_path = DEFAULT_DB_PATH
    conn = get_connection(db_path)
    cursor = conn.cursor()
    
    query = "SELECT * FROM guests WHERE 1=1"
    params = []

    if search:
        query += " AND (name LIKE ? OR institution LIKE ? OR purpose LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard])

    if category and category != 'Semua':
        query += " AND category = ?"
        params.append(category)

    # Sorting
    if sort_by == 'oldest':
        query += " ORDER BY created_at ASC"
    elif sort_by == 'name_asc':
        query += " ORDER BY name COLLATE NOCASE ASC"
    elif sort_by == 'name_desc':
        query += " ORDER BY name COLLATE NOCASE DESC"
    else:
        query += " ORDER BY created_at DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_guest_by_id(guest_id, db_path=None):
    if db_path is None:
        db_path = DEFAULT_DB_PATH
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM guests WHERE id = ?", (guest_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def add_guest(data, db_path=None):
    if db_path is None:
        db_path = DEFAULT_DB_PATH
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO guests (name, email, phone, institution, purpose, category, signature, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    """, (
        data.get('name', '').strip(),
        data.get('email', '').strip(),
        data.get('phone', '').strip(),
        data.get('institution', '').strip() or 'Pribadi / Umum',
        data.get('purpose', '').strip(),
        data.get('category', 'Umum').strip(),
        data.get('signature', '').strip(),
    ))
    guest_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return get_guest_by_id(guest_id, db_path=db_path)

def delete_guest(guest_id, db_path=None):
    if db_path is None:
        db_path = DEFAULT_DB_PATH
    conn = get_connection(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM guests WHERE id = ?", (guest_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def get_stats(db_path=None):
    if db_path is None:
        db_path = DEFAULT_DB_PATH
    conn = get_connection(db_path)
    cursor = conn.cursor()
    
    # Total guests
    cursor.execute("SELECT COUNT(*) AS total FROM guests")
    total = cursor.fetchone()['total']

    # Today's guests
    cursor.execute("SELECT COUNT(*) AS today FROM guests WHERE date(created_at) = date('now', 'localtime')")
    today = cursor.fetchone()['today']

    # By category
    cursor.execute("SELECT category, COUNT(*) as count FROM guests GROUP BY category")
    by_category = {row['category']: row['count'] for row in cursor.fetchall()}

    conn.close()
    return {
        'total': total,
        'today': today,
        'categories': by_category
    }
