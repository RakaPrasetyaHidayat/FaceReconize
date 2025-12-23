import { useState } from "react";
import WebcamFace from "../components/WebcamFace";
import { kirimAbsensi } from "../services/api";

const Absensi = () => {
  const [nama, setNama] = useState("");

  const handleDetect = async (namaSiswa) => {
    setNama(namaSiswa);

    await kirimAbsensi({
      nama: namaSiswa,
      waktu: new Date().toISOString(),
    });
  };

  return (
    <div>
      <h1>Absensi Wajah</h1>
      <WebcamFace onDetect={handleDetect} />
    </div>
  );
};

export default Absensi;
