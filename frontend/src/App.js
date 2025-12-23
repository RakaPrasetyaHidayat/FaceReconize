import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Absensi from "./pages/absensi";
import Dashboard from "./pages/dashboard";
import TeacherRecap from "./pages/teacherRecap";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              📸 Sistem Absensi Wajah
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Absensi Siswa
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/admin-dashboard" className="nav-link">
                  Dashboard Admin
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/teacher-recap" className="nav-link">
                  Rekap Guru
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Absensi />} />
          <Route path="/admin-dashboard" element={<Dashboard />} />
          <Route path="/teacher-recap" element={<TeacherRecap />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
