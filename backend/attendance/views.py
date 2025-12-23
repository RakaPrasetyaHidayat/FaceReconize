from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Attendance
from .serializers import AttendanceSerializer
from .model_loader import get_model
import base64
from django.utils import timezone
from datetime import datetime


class AttendanceView(APIView):
    def post(self, request):
        try:
            nama = request.data.get('nama', 'Unknown')
            waktu = request.data.get('waktu')
            image_data = request.data.get('image')

            if not image_data:
                return Response(
                    {'error': 'Image data is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            model = get_model()
            prediction = model.predict(image_data)

            attendance = Attendance.objects.create(
                nama=nama,
                confidence=prediction['confidence'],
                label=prediction['label'],
            )

            serializer = AttendanceSerializer(attendance)
            return Response({
                'status': 'success',
                'message': f'Attendance recorded for {nama}',
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
