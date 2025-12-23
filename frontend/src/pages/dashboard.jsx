import { useState, useEffect } from "react";
import { getAdminDashboard, getAllStudents } from "../services/api";
import "./dashboard.css";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [selectedDate]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminDashboard(selectedDate);
      if (response.status === "success") {
        setDashboardData(response);
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (kelas) => {
    setLoading(true);
    try {
      const response = await getAllStudents(kelas || null);
      if (response.status === "success") {
        setStudents(response.data);
      }
    } catch (err) {
      setError("Error loading students: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKelasChange = (kelas) => {
    setSelectedKelas(kelas);
    loadStudents(kelas || null);
  };

  const getClassOptions = () => {
    if (!dashboardData?.attendance_records) return [];
    const classes = new Set(
      dashboardData.attendance_records.map(
        (record) => record.siswa_detail?.Kelas || "Unknown"
      )
    );
    return Array.from(classes).filter((kelas) => kelas !== "Unknown");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Admin Dashboard</h1>
        <p>Pantau data absensi siswa setiap hari</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Siswa</h3>
              <p className="stat-value">
                {dashboardData?.total_students || 0}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <h3>Hadir Hari Ini</h3>
              <p className="stat-value">
                {dashboardData?.present_today || 0}
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>Persentase Kehadiran</h3>
              <p className="stat-value">
                {dashboardData?.summary?.present_percentage || 0}%
              </p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>Total Catatan</h3>
              <p className="stat-value">
                {dashboardData?.summary?.total_records || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Kelas</label>
            <select
              value={selectedKelas}
              onChange={(e) => handleKelasChange(e.target.value)}
              className="filter-input"
            >
              <option value="">Semua Kelas</option>
              {getClassOptions().map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="attendance-section">
          <h2>Data Absensi</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : dashboardData?.attendance_records?.length > 0 ? (
            <div className="attendance-table">
              <table>
                <thead>
                  <tr>
                    <th>Nama Siswa</th>
                    <th>NIS</th>
                    <th>Kelas</th>
                    <th>Waktu</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.attendance_records.map((record, index) => (
                    <tr key={index}>
                      <td>{record.siswa_detail?.Nama || record.nama}</td>
                      <td>{record.siswa_detail?.Nis || "-"}</td>
                      <td>{record.siswa_detail?.Kelas || "-"}</td>
                      <td>
                        {new Date(record.waktu).toLocaleString("id-ID")}
                      </td>
                      <td>
                        <span className="confidence-badge">
                          {(record.confidence * 100).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">Tidak ada data absensi untuk tanggal ini</div>
          )}
        </div>

        {students.length > 0 && (
          <div className="students-section">
            <h2>Daftar Siswa - {selectedKelas}</h2>
            <div className="students-grid">
              {students.map((student) => (
                <div key={student.NoAbsen} className="student-card">
                  <div className="student-info">
                    <h4>{student.Nama}</h4>
                    <p>NIS: {student.Nis}</p>
                    <p>No. Absen: {student.NoAbsen}</p>
                    <p className="kelas-badge">{student.Kelas}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
