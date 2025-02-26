import React, { useState } from "react";
import { QRCode } from "react-qr-code"; // Import QRCode component from react-qr-code

import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import Background from "../components/Background";
import styles from "../styles/loginPage.module.css"; // Importing the styles

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const [qrCodeValue, setQrCodeValue] = useState(""); // State for QR code value

  const handleRegister = async (e) => {
    setQrCodeValue(username); // Set QR code value to username

    e.preventDefault();
    setErrorMessage(""); // Reset error message
    setSuccessMessage(""); // Reset success message

    // Tambahkan log untuk melihat data yang akan dikirim
    console.log("Data yang akan dikirim:", {
      username,
      email,
      password,
    });

    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axiosInstance.post("/api/auth/register", {
        username,
        email,
        password,
      });
      // Log response dari server
      console.log("Response dari server:", response.data);
      setSuccessMessage("Registration successful! Please log in."); // Display success message
      setQrCodeValue(username); // Set QR code value to username
      navigate("/"); // Redirect to login page
    } catch (error) {
      // Log error lebih detail
      console.log("Request yang dikirim:", {
        method: "POST",
        url: "/api/auth/register",
        data: { username, email, password },
      });
      console.error("Error detail:", error.response?.data || error.message);

      setErrorMessage("Registration failed. Please try again."); // Display error message to the user
    }
  };

  return (
    <section className={styles.hero}> {/* Applying the hero class */}
      <Background />
      <div className={styles.hero_body}>
        <div className={styles.container}>
          <div className={styles.column}>
            <form onSubmit={handleRegister} className={styles.box}> {/* Applying the box class */}
              {errorMessage && <p className={styles.error_message}>{errorMessage}</p>} {/* Display error message */}
              {successMessage && <p className={styles.success_message}>{successMessage}</p>} {/* Display success message */}
              <div className={styles.field}>
                <label className={styles.label}>Username:</label>
                <input
                  type="text"
                  className={styles.input} // Applying the input class
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email:</label>
                <input
                  type="text"
                  className={styles.input} // Applying the input class
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Password:</label>
                <input
                  type="password"
                  className={styles.input} // Applying the input class
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.button}>Register</button> {/* Applying the button class */}
            </form>
            <p className={styles.p}>Sudah punya akun? <a href="/">Login sini</a></p>
          </div> 
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
