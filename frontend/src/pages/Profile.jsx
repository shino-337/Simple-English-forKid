import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { updateProfile, clearSuccess, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

/**
 * Profile page component for users to view and update their information
 * @returns {React.ReactNode}
 */
const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, isSuccess, error } = useSelector(state => state.auth);
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [email, setEmail] = useState('');
  
  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
      setEmail(user.email || '');
    }
  }, [user]);
  
  // Handle success and error messages
  useEffect(() => {
    if (isSuccess) {
      toast.success('Profile updated successfully!');
      dispatch(clearSuccess());
    }
    
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [isSuccess, error, dispatch]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    // Get updated fields (only send what changed)
    const updates = {};
    if (name !== user.name) updates.name = name;
    if (email !== user.email) updates.email = email;
    if (avatar !== user.avatar) updates.avatar = avatar;
    
    // Only dispatch if something changed
    if (Object.keys(updates).length > 0) {
      dispatch(updateProfile(updates));
    } else {
      toast.info('No changes to save');
    }
  };
  
  // Generate random avatar
  const generateRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(2, 8);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
    setAvatar(newAvatar);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
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
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        className="bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-6" 
          variants={itemVariants}
        >
          Your Profile
        </motion.h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <motion.div 
            className="flex flex-col items-center space-y-4" 
            variants={itemVariants}
          >
            <div className="relative">
              <img 
                src={avatar} 
                alt="User Avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
              />
              {user.isAdmin && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-md">
                  Admin
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={generateRandomAvatar}
              className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              New Random Avatar
            </button>
            
            <div className="bg-blue-50 rounded-lg p-3 text-center text-sm w-full">
              <p className="font-medium text-gray-700 mb-1">Account Status</p>
              <p className="text-gray-600">
                {user.isAdmin ? 'Administrator' : 'Regular User'}
              </p>
            </div>
          </motion.div>
          
          {/* Form Section */}
          <motion.div className="flex-1" variants={itemVariants}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your email"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Changing email will require you to log in again.
                </p>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
            
            <div className="mt-8 bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Learning Progress</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-gray-500 text-sm">Completed Words</p>
                  <p className="text-2xl font-bold text-blue-600">{user.progress?.completedWords || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-gray-500 text-sm">Categories Done</p>
                  <p className="text-2xl font-bold text-green-600">{user.progress?.completedCategories || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-gray-500 text-sm">Streak Days</p>
                  <p className="text-2xl font-bold text-orange-600">{user.progress?.streakDays || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-md border border-gray-200">
                  <p className="text-gray-500 text-sm">Last Active</p>
                  <p className="text-sm font-medium text-gray-700">
                    {user.progress?.lastActiveDate 
                      ? new Date(user.progress.lastActiveDate).toLocaleDateString() 
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile; 