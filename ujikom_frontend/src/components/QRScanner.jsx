import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const QRScanner = ({ onScan, onError }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 200,
        height: 200,
      },
      fps: 5,
    });

    scanner.render(
      (data) => {
        // Success callback
        onScan(data);
        // Optional: Stop scanning setelah berhasil
        scanner.clear();
      },
      (error) => {
        // Error callback
        if (onError) onError(error);
      }
    );

    // Cleanup pada unmount
    return () => {
      scanner.clear();
    };
  }, [onScan, onError]);

  const handleScan = async (data) => {
    if (data) {
      try {
        await axiosInstance.post("/api/auth/verify-qr", { qrToken: data.text });
        alert("Absensi berhasil!");
      } catch (error) {
        alert(error.response?.data?.message || "Gagal memproses QR code");
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    onError(err);
  };

  return (
    <div>
      <h2>Scan QR Code</h2>
      <div id="reader"></div>
    </div>
  );
};

export default QRScanner;
