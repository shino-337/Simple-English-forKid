import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, token, isAuthenticated } = useSelector(state => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/study');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Validate password
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    const result = await dispatch(loginUser({ email, password }));
    
    if (!result.error) {
      toast.success('Login successful! 🎉');
      navigate('/study');
    }
  };

  const setTestAccount = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setShowTestAccounts(false);
    toast.success(`Test account selected: ${testEmail}`);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div variants={itemVariants}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your email address"
            required
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your password"
            required
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <button
            type="button"
            onClick={() => setShowTestAccounts(!showTestAccounts)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            {showTestAccounts ? 'Hide test accounts' : 'Show test accounts'}
          </button>
          
          {showTestAccounts && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-left text-sm border border-gray-200">
              <p className="font-semibold text-gray-700 mb-2">Available test accounts:</p>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">Admin User:</span>
                      <br/>
                      <span className="text-gray-600">admin@example.com / admin123</span>
                    </div>
                    <button
                      onClick={() => setTestAccount('admin@example.com', 'admin123')}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Use Admin
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">Teacher Account:</span>
                      <br/>
                      <span className="text-gray-600">teacher@example.com / teacher123</span>
                    </div>
                    <button
                      onClick={() => setTestAccount('teacher@example.com', 'teacher123')}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Use Teacher
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">Regular User:</span>
                      <br/>
                      <span className="text-gray-600">user@example.com / user123</span>
                    </div>
                    <button
                      onClick={() => setTestAccount('user@example.com', 'user123')}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Use User
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">New Student:</span>
                      <br/>
                      <span className="text-gray-600">student1@example.com / student123</span>
                    </div>
                    <button
                      onClick={() => setTestAccount('student1@example.com', 'student123')}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Use Student
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="mt-2 text-xs text-gray-500">*Admin accounts have access to the Admin page</p>
            </div>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
};

export default LoginForm; 