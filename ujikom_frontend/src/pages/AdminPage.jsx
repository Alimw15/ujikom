import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../styles/AdminPage.css";
import axiosInstance from "../utils/axiosInstance";
import QrReader from "react-qr-scanner";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [activeContent, setActiveContent] = useState("scan");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newUser, setNewUser] = useState({
    id: null,
    username: "",
    email: "",
    password: "",
  });
  const [scannedData, setScannedData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastScan, setLastScan] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (user) => {
    setNewUser({
      id: user.id,
      username: user.username,
      email: user.email,
      password: "",
    });
    setEditMode(true);
    setShowModal(true);
  };

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

          await axiosInstance.post("/api/auth/scan-history", scanData);

          setLastScan({
            waktu: new Date().toLocaleString(),
            status: "Berhasil",
            pesan: result.message,
            data: qrText,
          });

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
        const scanData = {
          waktu: new Date().toISOString(),
          status: "Gagal",
          pesan: error.message,
        };

        await axiosInstance.post("/api/scan-history", scanData);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getUsers();
      } catch (error) {
        console.error("Error saat memuat data:", error);
      }
    };

    fetchData();
  }, []);

  const getUsers = async () => {
    try {
      const response = await axiosInstance.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <a
            href="#"
            className={`nav-item ${activeContent === "scan" ? "active" : ""}`}
            onClick={() => setActiveContent("scan")}
          >
            <svg className="nav-icon" viewBox="0 0 24 24">
              <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan QR
          </a>
          <a
            href="#"
            className={`nav-item ${activeContent === "users" ? "active" : ""}`}
            onClick={() => setActiveContent("users")}
          >
            <svg className="nav-icon" viewBox="0 0 24 24">
              <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Data User
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeContent === "scan" ? (
          <>
            <header className="main-header">
              <h1>Scan QR Code</h1>
            </header>

            <main className="content">
              <div className="card">
                <div className="scanner-container">
                  <QrReader
                    constraints={{
                      facingMode: "environment",
                      video: true,
                    }}
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      margin: "0 auto",
                    }}
                  />

                  {isLoading && (
                    <div className="loading-indicator">
                      <span>Memproses...</span>
                    </div>
                  )}

                  {lastScan && (
                    <div
                      className={`scan-result ${lastScan.status.toLowerCase()}`}
                    >
                      <h3>Hasil Scan Terakhir</h3>
                      <p>Waktu: {lastScan.waktu}</p>
                      <p>Status: {lastScan.status}</p>
                      <p>Pesan: {lastScan.pesan}</p>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </>
        ) : (
          <>
            <header className="main-header">
              <h1>Data User</h1>
            </header>

            <main className="content">
              <div className="card">
                <button
                  className="add-user-btn"
                  onClick={() => setShowModal(true)}
                >
                  <svg
                    className="add-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Tambah Data
                </button>

                {/* Modal Form */}
                {showModal && (
                  <div className="modal">
                    <div className="modal-content">
                      <h2>{editMode ? "Edit User" : "Tambah User Baru"}</h2>
                      <form onSubmit={handleSubmit}>
                        <div className="form-group">
                          <label>Username:</label>
                          <input
                            type="text"
                            name="username"
                            value={newUser.username}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Email:</label>
                          <input
                            type="email"
                            name="email"
                            value={newUser.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Password:</label>
                          <input
                            type="password"
                            name="password"
                            value={newUser.password}
                            onChange={handleInputChange}
                            placeholder={
                              editMode
                                ? "Kosongkan jika tidak ingin mengganti password"
                                : ""
                            }
                            required={!editMode}
                          />
                        </div>
                        <div className="modal-buttons">
                          <button type="submit" className="submit-btn">
                            Simpan
                          </button>
                          <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                              setShowModal(false);
                              setEditMode(false);
                              setNewUser({
                                id: null,
                                username: "",
                                email: "",
                                password: "",
                              });
                            }}
                          >
                            Batal
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="table-responsive">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.id}>
                          <td>{index + 1}</td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td className="action-buttons">
                            <button
                              className="edit-btn"
                              onClick={() => handleEdit(user)}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDelete(user.id)}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M3 6h18" />
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                              Hapus
                            </button>
                          </td>
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

export default AdminPage;
