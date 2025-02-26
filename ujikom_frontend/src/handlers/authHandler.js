import axiosInstance from "../utils/axiosInstance";

export const handleLogin = async (username, password, navigate, setLoading) => {
  try {
    setLoading(true);
    await axiosInstance.post(
      "http://localhost:5000/api/auth/login",
      {

        username: username,
        password: password
      },
      {
        withCredentials: true,
      }
    );
    navigate("/home");
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.msg);
    }
  } finally {
    setLoading(false);
  }
};
