import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/HomePage";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import LoginAdmin from "./pages/LoginAdmin";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-page" element={<AdminPage />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
