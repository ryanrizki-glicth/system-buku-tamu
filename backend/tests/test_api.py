import os
import unittest
import tempfile
import json
from app import app
from database import init_db

class GuestbookAPITest(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp()
        app.config['TESTING'] = True
        self.client = app.test_client()

        # Re-point database to test DB
        import database
        self.original_db = database.DEFAULT_DB_PATH
        database.DEFAULT_DB_PATH = self.db_path
        init_db(self.db_path)

    def tearDown(self):
        import database
        database.DEFAULT_DB_PATH = self.original_db
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_add_and_list_guest(self):
        # 1. Add a guest
        payload = {
            "name": "Budi Santoso",
            "institution": "Universitas Indonesia",
            "email": "budi@ui.ac.id",
            "phone": "08123456789",
            "category": "Kedinasan",
            "purpose": "Konsultasi kerja sama riset"
        }
        res = self.client.post('/api/guests', json=payload)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'success')
        guest_id = data['data']['id']

        # 2. List guests
        res = self.client.get('/api/guests')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['data'][0]['name'], "Budi Santoso")

        # 3. Filter guests
        res = self.client.get('/api/guests?search=Budi')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['count'], 1)

        res = self.client.get('/api/guests?category=Bisnis')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['count'], 0)

        # 4. Check stats
        res = self.client.get('/api/stats')
        self.assertEqual(res.status_code, 200)
        stats = json.loads(res.data)['data']
        self.assertEqual(stats['total'], 1)
        self.assertEqual(stats['categories']['Kedinasan'], 1)

        # 5. Delete guest
        res = self.client.delete(f'/api/guests/{guest_id}')
        self.assertEqual(res.status_code, 200)

        # 6. Verify deleted
        res = self.client.get('/api/guests')
        data = json.loads(res.data)
        self.assertEqual(data['count'], 0)

    def test_validation_errors(self):
        res = self.client.post('/api/guests', json={"name": ""})
        self.assertEqual(res.status_code, 400)

        res = self.client.post('/api/guests', json={"name": "Andi", "purpose": ""})
        self.assertEqual(res.status_code, 400)

if __name__ == '__main__':
    unittest.main()
