from django.db import models


class Attendance(models.Model):
    nama = models.CharField(max_length=100)
    waktu = models.DateTimeField(auto_now_add=True)
    confidence = models.FloatField(default=0.0)
    label = models.CharField(max_length=100, default='Unknown')

    class Meta:
        ordering = ['-waktu']

    def __str__(self):
        return f"{self.nama} - {self.waktu}"
