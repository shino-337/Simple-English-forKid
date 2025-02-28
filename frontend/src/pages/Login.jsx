import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import LoginForm from '../components/LoginForm';

/**
 * Login page component
 * @returns {React.ReactNode}
 */
const Login = () => {
  const { isSuccess } = useSelector(state => state.auth);
  
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <motion.div 
        className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-gray-800">Log In</h1>
          <p className="text-gray-600 mt-2">Welcome back to the Fun English Learning App</p>
        </motion.div>
        
        <LoginForm />
        
        <motion.div className="mt-6 text-center" variants={itemVariants}>
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login; 