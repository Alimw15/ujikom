import express from "express";
import userController from "../controllers/userController.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Middleware untuk autentikasi
router.use(verifyToken);

// User management routes
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
