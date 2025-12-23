const API_URL = "http://localhost:8000/api";

export const detectFace = async (imageData) => {
  const response = await fetch(`${API_URL}/detect/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: imageData,
    }),
  });

  return response.json();
};

export const studentAttendance = async (imageData, nis) => {
  const response = await fetch(`${API_URL}/student-attendance/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: imageData,
      nis: nis,
    }),
  });

  return response.json();
};

export const getStudentAttendanceHistory = async (nis) => {
  const url = nis 
    ? `${API_URL}/student-attendance/?nis=${nis}`
    : `${API_URL}/student-attendance/`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const getAdminDashboard = async (date) => {
  const url = date 
    ? `${API_URL}/admin/dashboard/?date=${date}`
    : `${API_URL}/admin/dashboard/`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const getAllStudents = async (kelas) => {
  const url = kelas 
    ? `${API_URL}/admin/students/?kelas=${kelas}`
    : `${API_URL}/admin/students/`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const getTeacherRecap = async (kelas, month, year) => {
  let url = `${API_URL}/teacher/recap/?kelas=${kelas}`;
  if (month) url += `&month=${month}`;
  if (year) url += `&year=${year}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const getAttendanceStats = async (kelas) => {
  const url = kelas 
    ? `${API_URL}/stats/?kelas=${kelas}`
    : `${API_URL}/stats/`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const kirimAbsensi = async (data) => {
  const response = await fetch(`${API_URL}/attendance/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

export const getAttendanceHistory = async () => {
  const response = await fetch(`${API_URL}/attendance/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};
