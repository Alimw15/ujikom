import ScanHistory from "../scanHistory.js";

const createScanHistory = async (req, res) => {
  try {
    const { waktu, status, pesan, qrToken } = req.body;
    const userId = req.user.id; // Ambil dari user yang terautentikasi

    const result = await ScanHistory.create({
      userId,
      waktu,
      status,
      pesan,
      qrToken,
    });

    res.status(201).json({
      message: "Riwayat scan berhasil disimpan",
      scanHistory: result,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Gagal menyimpan riwayat scan",
      error: error.message,
    });
  }
};

const getUserScanHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await ScanHistory.getByUserId(userId);
    res.status(200).json(history);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Gagal mengambil riwayat scan",
      error: error.message,
    });
  }
};

export default {
  createScanHistory,
  getUserScanHistory,
};
