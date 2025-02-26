import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Tidak ada token autentikasi'
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ambil data user dari database
    const [rows] = await db.execute(
      'SELECT id, username, email FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'User tidak ditemukan'
      });
    }

    // Simpan data user ke request object
    req.user = rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Token tidak valid'
    });
  }
};

export default authMiddleware;
