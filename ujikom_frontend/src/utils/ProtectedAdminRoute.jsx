import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  
  if (userRole !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedAdminRoute; 