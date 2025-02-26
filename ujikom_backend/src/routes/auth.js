import express from "express";
import authController from "../controllers/authController.js";
import scanHistoryController from "../controllers/scanHistoryController.js";

import verifyToken from "../middleware/auth.js"; // Import the verifyToken middleware

const router = express.Router();

// Attendance logging route
router.post("/attendance", verifyToken, authController.logAttendance);

// QR Code routes
router.post("/generate-qr", verifyToken, authController.generateQR);
router.post("/verify-qr", verifyToken, authController.verifyQRCode);
router.post("/scan-history",  verifyToken,scanHistoryController.createScanHistory);
router.get("/scan-history", verifyToken, scanHistoryController.getUserScanHistory);

// Endpoint untuk cek autentikasi
router.get("/check", verifyToken, authController.checkAuth);

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

export default router;
