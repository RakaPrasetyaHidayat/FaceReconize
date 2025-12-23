from django.contrib import admin
from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['nama', 'label', 'confidence', 'waktu']
    search_fields = ['nama', 'label']
    ordering = ['-waktu']
