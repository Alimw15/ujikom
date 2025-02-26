import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser'

import dotenv from "dotenv";
import pool from "./src/config/database.js";

import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/user.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from this origin
    credentials: true,
  })
); // Enable CORS
// Middleware for parsing JSON and URL-encoded data
app.use(cookieParser())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
