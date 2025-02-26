import bcrypt from "bcrypt";
import db from "../config/database.js";

const userController = {
  // Membuat user baru
  createUser: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Cek email yang sudah ada
      const [existingUser] = await db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user baru
      const [result] = await db.execute(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword]
      );

      // Ambil data user yang baru dibuat (tanpa password)
      const [newUser] = await db.execute(
        "SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?",
        [result.insertId]
      );

      res.status(201).json(newUser[0]);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Mendapatkan semua user
  getAllUsers: async (req, res) => {
    try {
      const [users] = await db.execute(
        "SELECT id, username, email, created_at, updated_at FROM users"
      );
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan saat mengambil data pengguna",
        error: error.message,
      });
    }
  },

  // Mendapatkan user berdasarkan ID
  getUserById: async (req, res) => {
    try {
      const [user] = await db.execute(
        "SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?",
        [req.params.id]
      );

      if (user.length === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }
      res.status(200).json(user[0]);
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { username, email } = req.body;
      const [result] = await db.execute(
        "UPDATE users SET username = ?, email = ? WHERE id = ?",
        [username, email, req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const [updatedUser] = await db.execute(
        "SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?",
        [req.params.id]
      );

      res.status(200).json(updatedUser[0]);
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },

  // Hapus user
  deleteUser: async (req, res) => {
    try {
      const [result] = await db.execute("DELETE FROM users WHERE id = ?", [
        req.params.id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      res.status(200).json({ message: "User berhasil dihapus" });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi kesalahan server",
        error: error.message,
      });
    }
  },
};

export default userController;
