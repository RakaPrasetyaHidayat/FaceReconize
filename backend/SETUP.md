# Backend Setup Guide

## Prerequisites
- Python 3.8+
- pip (Python package manager)

## Installation Steps

### 1. Create Virtual Environment
```bash
python -m venv venv
```

### 2. Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Migrations
```bash
python manage.py migrate
```

### 5. Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### 6. Start Development Server
```bash
python manage.py runserver
```

The server will run on `http://localhost:8000`

## API Endpoints

### Face Detection
- **URL:** `http://localhost:8000/api/detect/`
- **Method:** POST
- **Body:**
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

### Attendance Records
- **Get All:** `http://localhost:8000/api/attendance/` (GET)
- **Create:** `http://localhost:8000/api/attendance/` (POST)
- **Body:**
```json
{
  "nama": "Student Name",
  "image": "data:image/jpeg;base64,...",
  "confidence": 0.95,
  "waktu": "2024-12-23T20:00:00Z"
}
```

## Notes
- The model files (model.json, weights.bin, metadata.json) should be in the parent directory
- Make sure the frontend is running on `http://localhost:3000`
- CORS is configured to accept requests from the frontend
