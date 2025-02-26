import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../styles/loginPage.module.css"; // Importing the styles
import Swal from 'sweetalert2';
import Background from '../components/Background';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [qrCodeValue, setQrCodeValue] = useState(''); // State for QR code value


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username, 
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Login berhasil',
          icon: 'success',
          timer: 1500
        });
        navigate('/home');
      } else {
        throw new Error(data.message || 'Username atau password salah');
      }
    } catch (error) {
      Swal.fire({
        title: 'Gagal!',
        text: error.message,
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    //   <div className="max-w-md w-full space-y-8">
    //     <div>
    //       <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
    //         Login Admin
    //       </h2>
    //     </div>
    //     <form className="mt-8 space-y-6" onSubmit={handleLogin}>
    //       <div className="rounded-md shadow-sm -space-y-px">
    //         <div>
    //           <label htmlFor="username" className="sr-only">Username</label>
    //           <input
    //             id="username"
    //             name="username"
    //             type="text"
    //             required
    //             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
    //             placeholder="Username"
    //             value={username}
    //             onChange={(e) => setUsername(e.target.value)}
    //           />
    //         </div>
    //         <div>
    //           <label htmlFor="password" className="sr-only">Password</label>
    //           <input
    //             id="password"
    //             name="password"
    //             type="password"
    //             required
    //             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
    //             placeholder="Password"
    //             value={password}
    //             onChange={(e) => setPassword(e.target.value)}
    //           />
    //         </div>
    //       </div>

    //       <div>
    //         <button
    //           type="submit"
    //           disabled={loading}
    //           className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    //         >
    //           {loading ? 'Loading...' : 'Login'}
    //         </button>
    //       </div>
    //     </form>
    //   </div>
    // </div>
    <section className={styles.hero}> {/* Applying the hero class */}
    <Background />
    <div className={styles.hero_body}>
      <div className={styles.container}>
        <div className={styles.column}>
          <form onSubmit={handleLogin} className={styles.box}> {/* Applying the box class */}
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
              <label className={styles.label}>Password:</label>
              <input
                type="password"
                className={styles.input} // Applying the input class
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.button}>Login</button> {/* Applying the button class */}
          </form>
          <p className={styles.p}>Belum punya akun? <a href="/register">Register sini</a></p>
        </div>
      </div>
    </div>
  </section>
  );
};

export default LoginPage;