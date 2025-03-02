import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChallengeStats } from '../store/slices/challengeSlice';
import { fetchProgressStats, fetchCategoryProgress, fetchStudyHistory } from '../store/slices/progressSlice';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, TimeScale, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  TimeScale, 
  PointElement, 
  LineElement
);

const Progress = () => {
  const dispatch = useDispatch();
  const { stats: challengeStats, isLoading: challengeLoading, error: challengeError } = useSelector((state) => state.challenges);
  const { stats: progressStats, categoryProgress, studyHistory, isLoading: progressLoading, error: progressError } = useSelector((state) => state.progress);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Initialize data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadProgressData();
    }
  }, [dispatch, isAuthenticated]);

  // Function to load all progress data
  const loadProgressData = () => {
    console.log('Loading progress data...');
    dispatch(fetchChallengeStats());
    dispatch(fetchProgressStats());
    dispatch(fetchCategoryProgress());
    dispatch(fetchStudyHistory());
    setLastRefresh(Date.now());
  };

  // Refresh data when page visibility changes (user returns to the page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && Date.now() - lastRefresh > 30000) {
        console.log('Page became visible, refreshing data...');
        loadProgressData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, lastRefresh]);

  useEffect(() => {
    // Show toast if there's an error
    if (challengeError) {
      toast.error(`Error: ${challengeError}`);
    }
    if (progressError) {
      toast.error(`Error: ${progressError}`);
    }
  }, [challengeError, progressError]);

  // Debug logging for stats
  useEffect(() => {
    if (progressStats) {
      console.log('Rendering progress stats:', progressStats);
      console.log('Total words learned:', progressStats?.totalWordsLearned);
      console.log('Challenge stats:', progressStats?.challengeStats);
    }
    if (challengeStats) {
      console.log('Challenge stats from Redux:', challengeStats);
    }
  }, [progressStats, challengeStats]);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Format study time
  const formatStudyTime = (seconds) => {
    if (!seconds) return '0 min';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  // Prepare data for the pie chart
  const pieData = {
    labels: ['Correct Answers', 'Wrong Answers'],
    datasets: [
      {
        data: [
          challengeStats?.totalCorrect || 0, 
          challengeStats?.totalWrong || 0
        ],
        backgroundColor: ['#4ade80', '#f87171'],
        borderColor: ['#16a34a', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for the bar chart
  const barData = {
    labels: categoryProgress?.map(category => category.name) || [],
    datasets: [
      {
        label: 'Words Learned',
        data: categoryProgress?.map(category => category.completedWords) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
      {
        label: 'Total Words',
        data: categoryProgress?.map(category => category.totalWords) || [],
        backgroundColor: 'rgba(209, 213, 219, 0.5)',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Learning Progress by Category',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Words'
        }
      }
    }
  };

  // Prepare data for the line chart (words per day)
  const lineData = {
    datasets: [
      {
        label: 'Words Learned',
        data: progressStats?.wordsPerDay?.map(item => ({
          x: new Date(item.date),
          y: item.count
        })) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Words Learned Per Day',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM d, yyyy',
          displayFormats: {
            day: 'MMM d'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Words Learned'
        }
      }
    }
  };

  if (challengeLoading || progressLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Learning Progress 📊</h2>
        <button 
          onClick={loadProgressData}
          disabled={challengeLoading || progressLoading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-indigo-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          {(challengeLoading || progressLoading) ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Words Learned</h3>
          <p className="text-3xl font-bold text-indigo-600">{progressStats?.totalWordsLearned || 0}</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Challenge Accuracy</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {progressStats?.challengeStats?.accuracy || 0}%
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Daily Streak</h3>
          <p className="text-3xl font-bold text-indigo-600">{progressStats?.streakDays || 0} days</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Study Time</h3>
          <p className="text-3xl font-bold text-indigo-600">{formatStudyTime(progressStats?.totalStudyTime || 0)}</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Challenge Results</h3>
          <div className="w-full h-64 flex items-center justify-center">
            {challengeStats?.totalAttempts > 0 ? (
              <Pie data={pieData} />
            ) : (
              <p className="text-gray-500">No challenge data available yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Progress</h3>
          <div className="w-full h-64">
            {categoryProgress?.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No category progress available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Words Per Day Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Trend</h3>
        <div className="w-full h-80">
          {progressStats?.wordsPerDay?.length > 0 ? (
            <Line data={lineData} options={lineOptions} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No learning trend data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Learning Achievements */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'First Word', icon: '🔤', unlocked: progressStats?.totalWordsLearned >= 1 },
            { name: 'Word Collector', icon: '📚', unlocked: progressStats?.totalWordsLearned >= 10 },
            { name: 'Vocabulary Master', icon: '🧠', unlocked: progressStats?.totalWordsLearned >= 25 },
            { name: 'Perfect Challenge', icon: '🎯', unlocked: challengeStats?.perfectChallenges > 0 },
            { name: 'Study Streak', icon: '🔥', unlocked: progressStats?.streakDays >= 3 },
            { name: 'Category Explorer', icon: '🗺️', unlocked: progressStats?.categoriesWithProgress >= 3 },
            { name: 'Dedicated Learner', icon: '⏱️', unlocked: progressStats?.totalStudyTime >= 3600 },
            { name: 'Challenge Champion', icon: '🏆', unlocked: progressStats?.challengeStats?.accuracy >= 80 },
          ].map((achievement, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg text-center ${
                achievement.unlocked 
                  ? 'bg-indigo-50 border-2 border-indigo-200' 
                  : 'bg-gray-50 border border-gray-200 opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <h4 className="font-medium text-gray-900">{achievement.name}</h4>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Study History */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Study Sessions</h3>
        {studyHistory && studyHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Words Studied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Words Learned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studyHistory.slice(0, 5).map((session, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.category?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.wordsStudied?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.wordsLearned?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatStudyTime(session.timeSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No study history available yet</p>
        )}
      </div>
    </div>
  );
};

export default Progress; 