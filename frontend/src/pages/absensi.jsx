import { useState } from "react";
import WebcamFace from "../components/WebcamFace";
import { studentAttendance, getStudentAttendanceHistory } from "../services/api";
import "./absensi.css";

const Absensi = () => {
  const [nis, setNis] = useState("");
  const [nama, setNama] = useState("");
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [hasRecordedToday, setHasRecordedToday] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDetect = async (namaSiswa, imageData) => {
    if (!nis) {
      alert("Silakan masukkan NIS terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const response = await studentAttendance(imageData, nis);
      
      if (response.status === "success") {
        setNama(response.attendance.siswa_detail.Nama);
        setHasRecordedToday(true);
        
        const history = await getStudentAttendanceHistory(nis);
        setAttendanceHistory(history.data || []);

        setTimeout(() => {
          setNis("");
          setNama("");
          setHasRecordedToday(false);
        }, 3000);
      } else {
        alert("Error: " + response.error);
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNisSubmit = async () => {
    if (!nis) {
      alert("Silakan masukkan NIS");
      return;
    }
    
    setLoading(true);
    try {
      const history = await getStudentAttendanceHistory(nis);
      setAttendanceHistory(history.data || []);
    } catch (error) {
      alert("Error loading history: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absensi-container">
      <div className="absensi-header">
        <h1>📸 Sistem Absensi Wajah</h1>
        <p>Catat kehadiran Anda dengan pengenalan wajah</p>
      </div>

      <div className="absensi-content">
        {!hasRecordedToday ? (
          <>
            <div className="nis-input-section">
              <h2>Masukkan Data Diri</h2>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Masukkan NIS Anda"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  disabled={loading}
                  className="nis-input"
                  onKeyPress={(e) => e.key === "Enter" && handleNisSubmit()}
                />
                <button 
                  onClick={handleNisSubmit}
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? "Memproses..." : "Lanjut"}
                </button>
              </div>
            </div>

            {nis && (
              <div className="webcam-section">
                <WebcamFace onDetect={handleDetect} />
              </div>
            )}
          </>
        ) : (
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h3>Absensi Berhasil!</h3>
            <p>Nama: <strong>{nama}</strong></p>
            <p>NIS: <strong>{nis}</strong></p>
            <p>Waktu: <strong>{new Date().toLocaleString('id-ID')}</strong></p>
          </div>
        )}

        {attendanceHistory.length > 0 && (
          <div className="history-section">
            <h3>Riwayat Absensi Anda</h3>
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Waktu</th>
                    <th>Status</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.slice(0, 10).map((record, index) => (
                    <tr key={index}>
                      <td>{new Date(record.waktu).toLocaleDateString('id-ID')}</td>
                      <td>{new Date(record.waktu).toLocaleTimeString('id-ID')}</td>
                      <td className="status-hadir">Hadir</td>
                      <td>{(record.confidence * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Absensi;
