import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { detectFace, kirimAbsensi } from "../services/api";

const WebcamFace = ({ onDetect }) => {
  const webcamRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setHasPermission(true);
      setError(null);
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setError(
        "Izin kamera ditolak. Silakan aktifkan izin kamera untuk melanjutkan."
      );
      setHasPermission(false);
    }
  };

  const capture = async () => {
    if (webcamRef.current) {
      setLoading(true);
      setError(null);
      try {
        const imageSrc = webcamRef.current.getScreenshot();

        const response = await detectFace(imageSrc);

        if (response.status === "success") {
          const prediction = response.prediction;
          const label = prediction.label;
          const confidence = (prediction.confidence * 100).toFixed(2);

          setDetectionResult({
            label,
            confidence,
            allPredictions: prediction.all_predictions,
          });

          await kirimAbsensi({
            nama: label,
            image: imageSrc,
            confidence: prediction.confidence,
            waktu: new Date().toISOString(),
          });

          onDetect(label);
        } else {
          setError(response.error || "Deteksi wajah gagal");
        }
      } catch (err) {
        setError("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!hasPermission) {
    return (
      <div style={styles.container}>
        <div style={styles.permissionBox}>
          <h2>Izin Kamera Diperlukan</h2>
          <p>
            Aplikasi ini memerlukan akses ke kamera Anda untuk melakukan scan
            wajah.
          </p>
          <button
            onClick={requestCameraPermission}
            style={styles.button}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = "#0056b3")
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = "#007bff")
            }
          >
            Izinkan Akses Kamera
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
        height={300}
        style={styles.webcam}
      />
      <button
        onClick={capture}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) =>
          !loading && (e.target.style.backgroundColor = "#0056b3")
        }
        onMouseLeave={(e) =>
          !loading && (e.target.style.backgroundColor = "#007bff")
        }
      >
        {loading ? "Processing..." : "Scan Wajah"}
      </button>

      {detectionResult && (
        <div style={styles.resultBox}>
          <h3>Hasil Deteksi:</h3>
          <p>
            <strong>Nama:</strong> {detectionResult.label}
          </p>
          <p>
            <strong>Confidence:</strong> {detectionResult.confidence}%
          </p>
          <details>
            <summary>Detail Prediksi</summary>
            <pre style={styles.pre}>
              {JSON.stringify(detectionResult.allPredictions, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "20px",
  },
  permissionBox: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "30px",
    textAlign: "center",
    maxWidth: "400px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  webcam: {
    borderRadius: "8px",
    border: "2px solid #007bff",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  error: {
    color: "#d32f2f",
    marginTop: "10px",
    padding: "10px",
    border: "1px solid #d32f2f",
    borderRadius: "4px",
    backgroundColor: "#ffebee",
  },
  resultBox: {
    border: "1px solid #4caf50",
    borderRadius: "8px",
    padding: "15px",
    marginTop: "10px",
    maxWidth: "400px",
    backgroundColor: "#f1f8e9",
  },
  pre: {
    backgroundColor: "#f5f5f5",
    padding: "10px",
    borderRadius: "4px",
    overflowX: "auto",
    fontSize: "12px",
  },
};

export default WebcamFace;
