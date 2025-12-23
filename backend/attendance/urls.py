from django.urls import path
from .views import AttendanceView, FaceDetectView

urlpatterns = [
    path('attendance/', AttendanceView.as_view(), name='attendance'),
    path('detect/', FaceDetectView.as_view(), name='detect'),
]
