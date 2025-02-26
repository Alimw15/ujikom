import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react"; // Perlu install: npm install qrcode.react
import Swal from "sweetalert2";
import "../styles/AdminPage.css"; // Tambahkan import CSS
import axiosInstance from "../utils/axiosInstance";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [qrToken, setQrToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeContent, setActiveContent] = useState("qr");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newUser, setNewUser] = useState({
    id: null,
    username: "",
    email: "",
    password: "",
  });

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

  const handleDelete = async (userId) => {
    try {
      const result = await Swal.fire({
        title: "Apakah anda yakin?",
        text: "Data user dan semua riwayat scan akan dihapus permanen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        // Tidak perlu menghapus scan_history secara manual
        // karena akan otomatis terhapus berkat ON DELETE CASCADE
        const response = await axiosInstance.delete(`/api/users/${userId}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        if (response.status === 200) {
          await Swal.fire({
            title: "Terhapus!",
            text: "Data user dan riwayat scan berhasil dihapus.",
            icon: "success",
            timer: 1500,
          });
          getUsers();
        } else {
          throw new Error("Gagal menghapus data");
        }
      }
    } catch (error) {
      console.error("Error saat menghapus:", error);
      await Swal.fire({
        title: "Gagal!",
        text:
          error.response?.data?.message ||
          "Terjadi kesalahan saat menghapus data",
        icon: "error",
        timer: 1500,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const response = await axiosInstance.put(
          `/api/users/${newUser.id}`,
          newUser
        );
        if (response.status === 200) {
          Swal.fire({
            title: "Berhasil!",
            text: "Data user berhasil diperbarui",
            icon: "success",
            timer: 2000,
          });
        }
      } else {
        const response = await axiosInstance.post("/api/users", newUser);
        if (response.status === 201) {
          Swal.fire({
            title: "Berhasil!",
            text: "Data user berhasil ditambahkan",
            icon: "success",
            timer: 2000,
          });
        }
      }
      setShowModal(false);
      setNewUser({ id: null, username: "", email: "", password: "" });
      setEditMode(false);
      getUsers();
    } catch (error) {
      console.error("Error detail:", error.response?.data);
      Swal.fire({
        title: "Gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan pada server",
        icon: "error",
      });
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
            className={`nav-item ${activeContent === "qr" ? "active" : ""}`}
            onClick={() => setActiveContent("qr")}
          >
            <svg className="nav-icon" viewBox="0 0 24 24">
              <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Generate QR Code
          </a>
          <a
            href="#"
            className={`nav-item ${activeContent === "users" ? "active" : ""}`}
            onClick={() => setActiveContent("users")}
          >
            <svg className="nav-icon" viewBox="0 0 24 24">
              <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Data User
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeContent === "qr" ? (
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
        ) : activeContent === "users" ? (
          <>
            <header className="main-header">
              <h1>Data User</h1>
            </header>

            <main className="content">
              <div className="card">
                <h2>Daftar User</h2>
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
                      <h2>Tambah User Baru</h2>
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
                            required
                          />
                        </div>
                        <div className="modal-buttons">
                          <button type="submit" className="submit-btn">
                            Simpan
                          </button>
                          <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => setShowModal(false)}
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
        ) : null}
      </div>
    </div>
  );
};

export default AdminPage;
