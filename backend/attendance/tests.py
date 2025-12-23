from django.test import TestCase
from rest_framework.test import APIClient
from .models import Attendance


class AttendanceAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_get_attendance(self):
        Attendance.objects.create(
            nama='Test User',
            confidence=0.95,
            label='Test'
        )
        response = self.client.get('/api/attendance/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'success')
