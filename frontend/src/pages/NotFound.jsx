import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * 404 Not Found page component
 * @returns {React.ReactNode}
 */
const NotFound = () => {
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
      <motion.div 
        variants={itemVariants}
        className="text-7xl md:text-9xl font-bold text-blue-400 mb-6"
      >
        404
      </motion.div>
      
      <motion.h1 
        variants={itemVariants}
        className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center"
      >
        Oops! Page Not Found
      </motion.h1>
      
      <motion.p 
        variants={itemVariants}
        className="text-lg text-gray-600 max-w-md text-center mb-8"
      >
        The page you are looking for does not exist or has been moved.
      </motion.p>
      
      <motion.div variants={itemVariants}>
        <Link 
          to="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </motion.div>
      
      <motion.div 
        variants={itemVariants}
        className="mt-12 flex space-x-4"
      >
        <Link to="/study" className="text-blue-600 hover:underline">Study</Link>
        <Link to="/challenge" className="text-blue-600 hover:underline">Challenge</Link>
        <Link to="/progress" className="text-blue-600 hover:underline">Progress</Link>
      </motion.div>
    </motion.div>
  );
};

export default NotFound; 