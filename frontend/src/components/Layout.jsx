import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { motion } from 'framer-motion';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-kid-gradient">
      <nav className="bg-white shadow-lg border-b-4 border-yellow-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex space-x-8 items-center">
              <NavLink
                to="/study"
                className={({ isActive }) =>
                  `inline-flex items-center px-4 pt-1 border-b-4 text-lg font-baloo touch-target ${
                    isActive
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-indigo-400 hover:border-indigo-300 hover:text-indigo-500'
                  }`
                }
              >
                <span className="mr-2 text-3xl animate-float">📚</span>
                Study
              </NavLink>

              <NavLink
                to="/challenge"
                className={({ isActive }) =>
                  `inline-flex items-center px-4 pt-1 border-b-4 text-lg font-baloo touch-target ${
                    isActive
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-pink-400 hover:border-pink-300 hover:text-pink-500'
                  }`
                }
              >
                <span className="mr-2 text-3xl animate-bounce-light">🎯</span>
                Challenge
              </NavLink>

              <NavLink
                to="/progress"
                className={({ isActive }) =>
                  `inline-flex items-center px-4 pt-1 border-b-4 text-lg font-baloo touch-target ${
                    isActive
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-green-400 hover:border-green-300 hover:text-green-500'
                  }`
                }
              >
                <span className="mr-2 text-3xl animate-pulse-gentle">📊</span>
                Progress
              </NavLink>

              {user?.isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `inline-flex items-center px-4 pt-1 border-b-4 text-lg font-baloo touch-target ${
                      isActive
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-purple-400 hover:border-purple-300 hover:text-purple-500'
                    }`
                  }
                >
                  <span className="mr-2 text-3xl">⚙️</span>
                  Admin
                </NavLink>
              )}
            </div>

            <div className="flex items-center">
              {user && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={user.avatar || 'https://api.dicebear.com/6.x/bottts/svg?seed=' + user.name}
                        alt={user.name}
                        className="h-10 w-10 rounded-full border-2 border-yellow-300"
                      />
                      {user.isAdmin && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" title="Admin">
                          A
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-indigo-700 font-comic">
                        {user.name}
                      </span>
                      {user.isAdmin && (
                        <span className="text-xs text-red-500 font-semibold">
                          Admin User
                        </span>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-full bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md hover:shadow-lg transition-all duration-200 font-baloo touch-target"
                  >
                    <span className="mr-2">👋</span>
                    Logout
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
      
      {/* Background decorations */}
      <div className="fixed bottom-0 left-0 w-full h-24 pointer-events-none z-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-white opacity-30"
            style={{
              fontSize: `${Math.random() * 40 + 40}px`,
              left: `${i * 25 + Math.random() * 10}%`,
              bottom: `-${Math.random() * 10}px`,
              animation: `float ${Math.random() * 5 + 15}s linear infinite`,
              animationDelay: `${Math.random() * -5}s`,
            }}
          >
            {['🌿', '🌱', '🍃', '🌺', '🍄'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Layout; 