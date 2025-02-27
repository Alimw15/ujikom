import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../utils/axiosInstance";
import "../styles/HomePage.css";
import { QRCodeCanvas } from "qrcode.react";

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const [activeContent, setActiveContent] = useState("generate");
  const [scanHistory, setScanHistory] = useState([]);
  const [qrToken, setQrToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleError = (error) => {
    console.error("Terjadi kesalahan:", error);
  };

  const handleScan = async (data) => {
    if (data && !isLoading) {
      setIsLoading(true);
      try {
        const qrText = data.text || data;
        console.log("QR Token yang diterima:", qrText);

        if (!qrText.includes(".") || qrText.split(".").length !== 3) {
          throw new Error(
            "QR Code tidak valid! Gunakan QR Code yang dihasilkan dari sistem."
          );
        }

        const requestData = {
          qrToken: qrText,
          timestamp: new Date().toISOString(),
        };

        const response = await fetch(
          "http://localhost:5000/api/auth/verify-qr",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(requestData),
          }
        );

        const result = await response.json();

        if (response.ok) {
          const scanData = {
            waktu: new Date().toISOString(),
            status: "Berhasil",
            pesan: result.message,
            qrToken: qrText,
          };

          // Simpan ke database
          await axiosInstance.post("/api/auth/scan-history", scanData);

          // Update state dan tampilkan notifikasi sukses
          setLastScan({
            waktu: new Date().toLocaleString(),
            status: "Berhasil",
            pesan: result.message,
            data: qrText,
          });

          // Refresh riwayat scan
          getScanHistory();

          Swal.fire({
            title: "Berhasil!",
            text: result.message,
            icon: "success",
            timer: 2000,
          });
        } else {
          throw new Error(
            result.message || "QR Code tidak valid atau sudah kadaluarsa"
          );
        }
      } catch (error) {
        console.error("Error detail:", error);
        // Simpan riwayat gagal
        const scanData = {
          waktu: new Date().toISOString(),
          status: "Gagal",
          pesan: error.message,
        };

        await axiosInstance.post("/api/scan-history", scanData);

        // Update state dan tampilkan error
        setLastScan({
          waktu: new Date().toLocaleString(),
          status: "Gagal",
          pesan: error.message,
        });

        Swal.fire({
          title: "Gagal!",
          html: `<p>${error.message}</p>
                 <p class="text-sm text-gray-500 mt-2">Pastikan Anda menggunakan QR Code yang dihasilkan dari sistem absensi.</p>`,
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data pengguna");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Error",
        text: "Gagal mengambil data pengguna",
        icon: "error",
      });
    }
  };

  const getScanHistory = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/scan-history",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setScanHistory(data);
      }
    } catch (error) {
      console.error("Error mengambil riwayat:", error);
      Swal.fire({
        title: "Gagal!",
        text: "Gagal mengambil riwayat scan",
        icon: "error",
      });
    }
  };

  const generateQR = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/auth/generate-qr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setQrToken(data.token);
        Swal.fire({
          title: "Berhasil!",
          text: "QR Code berhasil dibuat",
          icon: "success",
          timer: 2000,
        });
      } else {
        throw new Error(data.message || "Gagal membuat QR Code");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: "Gagal!",
        text: error.message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "qr-code.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/api/auth/logout");
      if (response.status === 200) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout error:", error);
      Swal.fire({
        title: "Error",
        text: "Gagal logout. Silakan coba lagi.",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/check", {
          credentials: "include",
        });
        if (response.ok) {
          await getUsers();
          await getScanHistory();
        } else {
          throw new Error("Autentikasi gagal");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        Swal.fire({
          title: "Error",
          text: "Gagal melakukan autentikasi. Silakan coba lagi.",
          icon: "error",
        });
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>User Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <a
            href="#"
            className={`nav-item ${activeContent === "generate" ? "active" : ""}`}
            onClick={() => setActiveContent("generate")}
          >
            <svg className="nav-icon" viewBox="0 0 24 24">
              <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Generate QR
          </a>
          <a
            href="#"
            className={`nav-item ${activeContent === "history" ? "active" : ""}`}
            onClick={() => setActiveContent("history")}
          >
            <svg className="nav-icon" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Riwayat Scan
          </a>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <svg className="nav-icon" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeContent === "generate" ? (
          <>
            <header className="main-header">
              <h1>Generate QR Code</h1>
            </header>

            <main className="content">
              <div className="card">
                <div className="qr-container">
                  <button
                    onClick={generateQR}
                    disabled={loading}
                    className="generate-btn"
                  >
                    {loading ? (
                      <span className="loading-text">
                        <svg className="loading-icon" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      "Generate QR Code"
                    )}
                  </button>

                  {qrToken && (
                    <div className="qr-result">
                      <div className="qr-code-container">
                        <QRCodeCanvas
                          id="qr-code"
                          value={qrToken}
                          size={256}
                          level="H"
                          includeMargin={true}
                        />
                      </div>

                      <button onClick={downloadQR} className="download-btn">
                        <svg className="download-icon" viewBox="0 0 24 24">
                          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download QR Code
                      </button>

                      <div className="info-text">
                        <p>Token akan kadaluarsa dalam beberapa menit.</p>
                        <p>Generate QR Code baru jika diperlukan.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </>
        ) : (
          <>
            <header className="main-header">
              <h1>Riwayat Scan</h1>
            </header>

            <main className="content">
              <div className="card">
                <div className="table-responsive">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Waktu</th>
                        <th>Status</th>
                        <th>Pesan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanHistory.map((scan, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{new Date(scan.waktu).toLocaleString()}</td>
                          <td>
                            <span
                              className={`status-badge ${scan.status.toLowerCase()}`}
                            >
                              {scan.status}
                            </span>
                          </td>
                          <td>{scan.pesan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
