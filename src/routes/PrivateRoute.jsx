import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  // If a user exists in context, render the protected page.
  // If not, redirect to the login page.
  return user ? children : <Navigate to='/login' replace />;
};

export default PrivateRoute;
