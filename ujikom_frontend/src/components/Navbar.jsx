import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
      navigate("/");
    } catch (error) {
      console.error("Logout Failed", error);
    }
  };
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>

      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
