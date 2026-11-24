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
        # 1. Add a guest with signature
        payload = {
            "name": "Budi Santoso",
            "institution": "Universitas Indonesia",
            "email": "budi@ui.ac.id",
            "phone": "08123456789",
            "category": "Kedinasan",
            "purpose": "Konsultasi kerja sama riset",
            "signature": "data:image/png;base64,mocksignature"
        }
        res = self.client.post('/api/guests', json=payload)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'success')
        guest_id = data['data']['id']
        self.assertEqual(data['data']['signature'], "data:image/png;base64,mocksignature")

        # 2. Add second guest
        payload2 = {
            "name": "Andi Wijaya",
            "institution": "Startup XYZ",
            "category": "Bisnis",
            "purpose": "Diskusi kemitraan bisnis"
        }
        self.client.post('/api/guests', json=payload2)

        # 3. List guests sorted by name
        res = self.client.get('/api/guests?sort_by=name_asc')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['count'], 2)
        self.assertEqual(data['data'][0]['name'], "Andi Wijaya")
        self.assertEqual(data['data'][1]['name'], "Budi Santoso")

        # 4. Filter guests
        res = self.client.get('/api/guests?search=Budi')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['count'], 1)

        # 5. Check stats
        res = self.client.get('/api/stats')
        self.assertEqual(res.status_code, 200)
        stats = json.loads(res.data)['data']
        self.assertEqual(stats['total'], 2)

        # 6. Delete guest
        res = self.client.delete(f'/api/guests/{guest_id}')
        self.assertEqual(res.status_code, 200)

        # 7. Verify deleted
        res = self.client.get('/api/guests')
        data = json.loads(res.data)
        self.assertEqual(data['count'], 1)

    def test_validation_errors(self):
        res = self.client.post('/api/guests', json={"name": ""})
        self.assertEqual(res.status_code, 400)

        res = self.client.post('/api/guests', json={"name": "Andi", "purpose": ""})
        self.assertEqual(res.status_code, 400)

if __name__ == '__main__':
    unittest.main()
