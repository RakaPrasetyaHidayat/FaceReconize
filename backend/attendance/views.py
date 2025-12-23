from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Attendance, Siswa, Guru
from .serializers import AttendanceSerializer, SiswaSerializer, GuruSerializer
from .model_loader import get_model
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta


class FaceDetectView(APIView):
    def post(self, request):
        try:
            image_data = request.data.get('image')

            if not image_data:
                return Response(
                    {'error': 'Image data is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            model = get_model()
            prediction = model.predict(image_data)

            return Response({
                'status': 'success',
                'prediction': prediction
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class StudentAttendanceView(APIView):
    def post(self, request):
        try:
            image_data = request.data.get('image')
            nis = request.data.get('nis')

            if not image_data:
                return Response(
                    {'error': 'Image data is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            model = get_model()
            prediction = model.predict(image_data)

            try:
                siswa = Siswa.objects.get(Nis=nis)
            except Siswa.DoesNotExist:
                return Response(
                    {'error': f'Student with NIS {nis} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            attendance = Attendance.objects.create(
                siswa=siswa,
                nama=siswa.Nama,
                confidence=prediction['confidence'],
                label=prediction['label'],
            )

            serializer = AttendanceSerializer(attendance)
            return Response({
                'status': 'success',
                'message': f'Attendance recorded for {siswa.Nama}',
                'prediction': prediction,
                'attendance': serializer.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get(self, request):
        try:
            nis = request.query_params.get('nis')
            
            if nis:
                attendances = Attendance.objects.filter(siswa__Nis=nis)
            else:
                attendances = Attendance.objects.all()
            
            serializer = AttendanceSerializer(attendances, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AdminDashboardView(APIView):
    def get(self, request):
        try:
            date_filter = request.query_params.get('date')
            
            if date_filter:
                start_date = datetime.strptime(date_filter, '%Y-%m-%d').replace(hour=0, minute=0, second=0)
                end_date = start_date + timedelta(days=1)
                attendances = Attendance.objects.filter(
                    waktu__gte=start_date,
                    waktu__lt=end_date
                )
            else:
                attendances = Attendance.objects.all()
            
            total_students = Siswa.objects.count()
            present_today = attendances.filter(
                waktu__gte=timezone.now().replace(hour=0, minute=0, second=0)
            ).values('siswa').distinct().count()
            
            serializer = AttendanceSerializer(attendances, many=True)
            
            return Response({
                'status': 'success',
                'total_students': total_students,
                'present_today': present_today,
                'attendance_records': serializer.data,
                'summary': {
                    'total_records': len(serializer.data),
                    'present_percentage': round((present_today / total_students * 100), 2) if total_students > 0 else 0
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AdminStudentsView(APIView):
    def get(self, request):
        try:
            kelas = request.query_params.get('kelas')
            
            if kelas:
                students = Siswa.objects.filter(Kelas=kelas)
            else:
                students = Siswa.objects.all()
            
            serializer = SiswaSerializer(students, many=True)
            return Response({
                'status': 'success',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class TeacherRecapView(APIView):
    def get(self, request):
        try:
            kelas = request.query_params.get('kelas')
            month = request.query_params.get('month')
            year = request.query_params.get('year')
            
            if not kelas:
                return Response(
                    {'error': 'kelas parameter is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            students = Siswa.objects.filter(Kelas=kelas)
            
            recap_data = []
            for student in students:
                attendance_records = Attendance.objects.filter(siswa=student)
                
                if month and year:
                    start_date = datetime(int(year), int(month), 1)
                    if int(month) == 12:
                        end_date = datetime(int(year) + 1, 1, 1)
                    else:
                        end_date = datetime(int(year), int(month) + 1, 1)
                    attendance_records = attendance_records.filter(
                        waktu__gte=start_date,
                        waktu__lt=end_date
                    )
                
                present_count = attendance_records.count()
                
                recap_data.append({
                    'siswa': {
                        'NoAbsen': student.NoAbsen,
                        'Nis': student.Nis,
                        'Nama': student.Nama
                    },
                    'present_count': present_count,
                    'last_attendance': attendance_records.first().waktu if attendance_records.exists() else None
                })
            
            return Response({
                'status': 'success',
                'kelas': kelas,
                'month': month,
                'year': year,
                'recap': recap_data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class AttendanceStatsView(APIView):
    def get(self, request):
        try:
            kelas = request.query_params.get('kelas')
            
            if kelas:
                students = Siswa.objects.filter(Kelas=kelas)
            else:
                students = Siswa.objects.all()
            
            stats = []
            for student in students:
                total_attendance = Attendance.objects.filter(siswa=student).count()
                stats.append({
                    'nama': student.Nama,
                    'kelas': student.Kelas,
                    'total_attendance': total_attendance
                })
            
            return Response({
                'status': 'success',
                'stats': stats
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
