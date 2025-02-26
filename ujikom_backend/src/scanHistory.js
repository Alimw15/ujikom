import db from "./config/database.js";

const ScanHistory = {
  create: async (scanData) => {
    const query = `
      INSERT INTO scan_history (user_id, waktu, status, pesan, qr_token) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      scanData.userId,
      scanData.waktu,
      scanData.status,
      scanData.pesan,
      scanData.qrToken
    ]);
    return result;
  },

  getByUserId: async (userId) => {
    const query = `
      SELECT * FROM scan_history 
      WHERE user_id = ? 
      ORDER BY waktu DESC 
      LIMIT 50
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }
};

export default ScanHistory;
