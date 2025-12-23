import { useState, useEffect } from "react";
import { getTeacherRecap, getAllStudents } from "../services/api";
import "./teacherRecap.css";

const TeacherRecap = () => {
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [recapData, setRecapData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await getAllStudents();
      if (response.status === "success") {
        const uniqueClasses = [...new Set(response.data.map((s) => s.Kelas))];
        setClasses(uniqueClasses.sort());
        if (uniqueClasses.length > 0) {
          setSelectedKelas(uniqueClasses[0]);
        }
      }
    } catch (err) {
      console.error("Error loading classes:", err);
    }
  };

  const loadRecap = async () => {
    if (!selectedKelas) {
      setError("Pilih kelas terlebih dahulu");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getTeacherRecap(
        selectedKelas,
        selectedMonth,
        selectedYear
      );
      if (response.status === "success") {
        setRecapData(response);
      } else {
        setError("Failed to load recap data");
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadRecap = () => {
    loadRecap();
  };

  const calculateStatistics = () => {
    if (!recapData?.recap) return {};

    const totalStudents = recapData.recap.length;
    const presentCounts = recapData.recap.map((r) => r.present_count);
    const totalPresent = presentCounts.reduce((a, b) => a + b, 0);
    const avgPresent = (totalPresent / totalStudents).toFixed(1);

    return {
      totalStudents,
      totalPresent,
      avgPresent,
      maxPresent: Math.max(...presentCounts),
      minPresent: Math.min(...presentCounts),
    };
  };

  const getMonthName = (month) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[parseInt(month) - 1];
  };

  const stats = calculateStatistics();
  const monthName = getMonthName(selectedMonth);

  const downloadRecap = () => {
    if (!recapData?.recap) return;

    let csvContent = "Rekap Absensi\n";
    csvContent += `Kelas: ${selectedKelas}\n`;
    csvContent += `Periode: ${monthName} ${selectedYear}\n\n`;
    csvContent += "No Absen,NIS,Nama,Hadir\n";

    recapData.recap.forEach((item) => {
      csvContent += `${item.siswa.NoAbsen},${item.siswa.Nis},"${item.siswa.Nama}",${item.present_count}\n`;
    });

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
    );
    element.setAttribute("download", `rekap-${selectedKelas}-${selectedYear}-${selectedMonth}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="teacher-recap-container">
      <div className="recap-header">
        <h1>📋 Rekap Absensi Guru</h1>
        <p>Lihat ringkasan kehadiran siswa per kelas dan per bulan</p>
      </div>

      <div className="recap-content">
        <div className="filters-box">
          <div className="filter-group">
            <label>Kelas</label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="filter-input"
            >
              <option value="">-- Pilih Kelas --</option>
              {classes.map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="filter-input"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                  {getMonthName(String(i + 1).padStart(2, "0"))}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="filter-input"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <button onClick={handleLoadRecap} className="load-btn">
            Tampilkan Rekap
          </button>
        </div>

        {recapData && (
          <>
            <div className="recap-info">
              <h2>
                Rekap Kelas {selectedKelas} - {monthName} {selectedYear}
              </h2>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <h4>Total Siswa</h4>
                <p className="stat-number">{stats.totalStudents}</p>
              </div>
              <div className="stat-box">
                <h4>Total Kehadiran</h4>
                <p className="stat-number">{stats.totalPresent}</p>
              </div>
              <div className="stat-box">
                <h4>Rata-rata Hadir</h4>
                <p className="stat-number">{stats.avgPresent}</p>
              </div>
              <div className="stat-box">
                <h4>Max Hadir</h4>
                <p className="stat-number">{stats.maxPresent}</p>
              </div>
            </div>

            <div className="recap-table-container">
              <div className="recap-table-header">
                <h3>Detail Absensi Siswa</h3>
                <button onClick={downloadRecap} className="download-btn">
                  📥 Download CSV
                </button>
              </div>

              {recapData.recap && recapData.recap.length > 0 ? (
                <div className="recap-table">
                  <table>
                    <thead>
                      <tr>
                        <th>No Absen</th>
                        <th>NIS</th>
                        <th>Nama Siswa</th>
                        <th>Hadir (Hari)</th>
                        <th>Terakhir Hadir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recapData.recap.map((item, index) => (
                        <tr key={index}>
                          <td className="text-center">{item.siswa.NoAbsen}</td>
                          <td className="text-center">{item.siswa.Nis}</td>
                          <td>{item.siswa.Nama}</td>
                          <td className="text-center">
                            <span className="present-badge">
                              {item.present_count}
                            </span>
                          </td>
                          <td>
                            {item.last_attendance
                              ? new Date(item.last_attendance).toLocaleDateString(
                                  "id-ID"
                                )
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  Tidak ada data rekap untuk periode ini
                </div>
              )}
            </div>
          </>
        )}

        {loading && <div className="loading">Memproses data...</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default TeacherRecap;
