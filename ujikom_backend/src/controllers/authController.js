import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/database.js";
import QRCode from "qrcode";

const authController = {
  // Log attendance controller
  logAttendance: async (req, res) => {
    try {
      const { qrData } = req.body;

      // Verify the user associated with the QR code
      const [users] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [qrData]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      const user = users[0];

      // Log attendance in the database
      await pool.query(
        "INSERT INTO attendance (user_id, timestamp) VALUES (?, ?)",
        [user.id, new Date()]
      );

      res.status(200).json({ message: "Absensi berhasil dicatat" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },

  // Register controller
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Cek apakah username sudah ada
      const [existingUser] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Simpan user baru
      await pool.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword]
      );

      res.status(201).json({ message: "Registrasi berhasil" });
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },

  // Login controller
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Cek user
      const [users] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );

      if (users.length === 0) {
        return res
          .status(401)
          .json({ message: "Username atau password salah" });
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res
          .status(401)
          .json({ message: "Username atau password salah" });
      }

      // Buat token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Simpan token di cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000, // 1 jam
      });

      res.json({
        message: "Login berhasil",
      });
    } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },

  // Logout controller
  logout: (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout berhasil" });
  },

  // Protected route controller
  getProtectedData: (req, res) => {
    res.json({ message: "Ini adalah route yang dilindungi", user: req.user });
  },

  // Generate QR Code untuk absensi
  generateQR: async (req, res) => {
    try {
      // Generate token QR yang akan expired dalam 5 menit
      const qrToken = jwt.sign(
        {
          type: "qr_code",
          timestamp: new Date().toISOString(),
        },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );

      res.json({
        status: "success",
        message: "QR Code berhasil dibuat",
        token: qrToken,
      });
    } catch (error) {
      console.error("Error generating QR:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal membuat QR Code",
      });
    }
  },

  // Verify QR Code
  verifyQRCode: async (req, res) => {
    try {
      const { qrToken } = req.body;

      // Verify QR token
      const decoded = jwt.verify(qrToken, process.env.JWT_SECRET);

      if (decoded.type !== "qr_code") {
        throw new Error("Invalid QR Code type");
      }

      // Di sini bisa ditambahkan logika untuk mencatat absensi
      // Misalnya menyimpan ke database

      res.json({
        status: "success",
        message: "QR Code valid, absensi berhasil dicatat",
      });
    } catch (error) {
      console.error("Error verifying QR:", error);
      res.status(400).json({
        status: "error",
        message: "QR Code tidak valid atau sudah kadaluarsa",
      });
    }
  },

  checkAuth: async (req, res) => {
    try {
      // User sudah terverifikasi karena sudah melewati middleware verifyToken
      return res.status(200).json({
        success: true,
        message: "User terautentikasi",
        user: req.user, // ini akan berisi data user dari middleware verifyToken
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },
};

export default authController;
