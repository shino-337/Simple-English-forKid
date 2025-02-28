import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { registerUser, loginUser } from '../store/slices/authSlice';
import { AVATAR_OPTIONS } from '../config';
import toast from 'react-hot-toast';
import LoginForm from '../components/LoginForm';

const Welcome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token, isLoading, error } = useSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [step, setStep] = useState(1);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (token && user) {
      navigate('/study');
    }
  }, [token, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address");
        return;
      }
      
      // Validate password length
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
      
      if (name.length >= 2) {
        setStep(2);
        return;
      } else {
        toast.error("Name must be at least 2 characters long");
      }
    }

    if (step === 2) {
      const result = await dispatch(
        registerUser({ 
          name, 
          email, 
          password,
          avatar: selectedAvatar 
        })
      );
      if (!result.error) {
        toast.success('Welcome to English Learning App! 🎉');
        // After successful registration, login the user automatically and redirect
        navigate('/study');
      }
    }
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
    setStep(1); // Reset step when toggling
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to English Learning! 🌟
          </h1>
          <p className="text-gray-600">
            {showLogin 
              ? "Log in to continue your journey" 
              : "Let's start your learning journey!"}
          </p>
        </motion.div>

        {showLogin ? (
          <LoginForm />
        ) : (
          <div>
            {step === 1 ? (
              <motion.form 
                onSubmit={handleSubmit} 
                variants={containerVariants}
                className="mt-8 space-y-6"
              >
                <motion.div variants={itemVariants}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What should we call you?"
                    required
                  />
                </motion.div>

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
                    placeholder="Create a password (min. 6 characters)"
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Continue'}
                  </button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.form 
                onSubmit={handleSubmit} 
                variants={containerVariants}
                className="mt-8 space-y-6"
              >
                <motion.div variants={itemVariants} className="text-center mb-4">
                  <h2 className="text-xl font-semibold">Choose Your Avatar</h2>
                  <p className="text-gray-600 text-sm">This will represent you in the app</p>
                </motion.div>

                <motion.div 
                  variants={itemVariants} 
                  className="grid grid-cols-5 gap-2 justify-items-center max-w-md mx-auto"
                >
                  {AVATAR_OPTIONS.map((avatar, index) => (
                    <div 
                      key={index} 
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`cursor-pointer p-1 rounded-full ${
                        selectedAvatar === avatar ? 'bg-blue-200 ring-2 ring-blue-500' : 'hover:bg-gray-100'
                      }`}
                    >
                      <img 
                        src={avatar} 
                        alt={`Avatar option ${index + 1}`} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                  ))}
                </motion.div>

                <motion.div variants={itemVariants} className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating Account...' : 'Start Learning'}
                  </button>
                </motion.div>
              </motion.form>
            )}
          </div>
        )}

        <motion.div variants={itemVariants} className="text-center mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-600">
            {showLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={toggleForm}
              className="ml-1 text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
            >
              {showLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome; 