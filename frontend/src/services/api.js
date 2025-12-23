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
