from django.db import models


class Guru(models.Model):
    NIP = models.IntegerField(primary_key=True)
    Nama = models.CharField(max_length=150)

    class Meta:
        db_table = 'guru'

    def __str__(self):
        return f"{self.NIP} - {self.Nama}"


class Siswa(models.Model):
    NoAbsen = models.IntegerField(primary_key=True)
    Nis = models.IntegerField()
    Nama = models.TextField()
    Kelas = models.CharField(max_length=70)
    tanggalabsen = models.DateTimeField()

    class Meta:
        db_table = 'siswa'

    def __str__(self):
        return f"{self.Nis} - {self.Nama} ({self.Kelas})"


class Attendance(models.Model):
    siswa = models.ForeignKey(Siswa, on_delete=models.CASCADE, related_name='attendance_records')
    nama = models.CharField(max_length=100)
    waktu = models.DateTimeField(auto_now_add=True)
    confidence = models.FloatField(default=0.0)
    label = models.CharField(max_length=100, default='Unknown')

    class Meta:
        ordering = ['-waktu']

    def __str__(self):
        return f"{self.nama} - {self.waktu}"
