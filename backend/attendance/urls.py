from django.urls import path
from .views import (
    StudentAttendanceView, 
    FaceDetectView,
    AdminDashboardView,
    AdminStudentsView,
    TeacherRecapView,
    AttendanceStatsView
)

urlpatterns = [
    path('student-attendance/', StudentAttendanceView.as_view(), name='student-attendance'),
    path('detect/', FaceDetectView.as_view(), name='detect'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/students/', AdminStudentsView.as_view(), name='admin-students'),
    path('teacher/recap/', TeacherRecapView.as_view(), name='teacher-recap'),
    path('stats/', AttendanceStatsView.as_view(), name='attendance-stats'),
]
