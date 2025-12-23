from rest_framework import serializers
from .models import Attendance, Siswa, Guru


class GuruSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guru
        fields = ['NIP', 'Nama']


class SiswaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Siswa
        fields = ['NoAbsen', 'Nis', 'Nama', 'Kelas', 'tanggalabsen']


class AttendanceSerializer(serializers.ModelSerializer):
    siswa_detail = SiswaSerializer(source='siswa', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'siswa', 'siswa_detail', 'nama', 'waktu', 'confidence', 'label']
        read_only_fields = ['id', 'waktu']
