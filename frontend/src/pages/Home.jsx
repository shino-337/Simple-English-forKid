import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Loader from '../components/common/Loader';

/**
 * Home page component that redirects based on authentication status
 * @returns {React.ReactNode}
 */
const Home = () => {
  const navigate = useNavigate();
  const { token, isLoading } = useSelector(state => state.auth);
  
  useEffect(() => {
    // If authenticated, redirect to study page
    // Otherwise redirect to login page after a short delay
    const timer = setTimeout(() => {
      if (token) {
        navigate('/study');
      } else {
        navigate('/login');
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [navigate, token]);
  
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
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <img 
          src="/logo.png" 
          alt="Fun English Learning App Logo" 
          className="w-24 h-24 object-contain"
        />
      </motion.div>
      
      <motion.h1 
        variants={itemVariants}
        className="text-3xl md:text-4xl font-bold text-blue-600 mb-4 text-center"
      >
        Fun English Learning App
      </motion.h1>
      
      <motion.p 
        variants={itemVariants}
        className="text-lg text-gray-600 max-w-md text-center mb-8"
      >
        Redirecting you to the right place...
      </motion.p>
      
      <motion.div variants={itemVariants}>
        <Loader size="medium" color="blue" />
      </motion.div>
    </motion.div>
  );
};

export default Home; 