import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../store/slices/authSlice';
import Loader from './common/Loader';

/**
 * ProtectedRoute component to guard routes that require authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} [props.adminOnly=false] - If true, only allow admin users
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, token, loading, isAuthenticated } = useSelector((state) => state.auth);
  
  useEffect(() => {
    // If we have a token but no user, fetch the profile
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, token, user]);
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="large" />
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If adminOnly and user is not admin, redirect to study page
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/study" replace />;
  }
  
  // User is authenticated and meets requirements
  return children;
};

export default ProtectedRoute; 