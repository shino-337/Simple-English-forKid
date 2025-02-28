import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChallengeStats } from '../store/slices/challengeSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Progress = () => {
  const dispatch = useDispatch();
  const { stats, isLoading: statsLoading } = useSelector((state) => state.challenges);
  const { categories, isLoading: categoriesLoading } = useSelector((state) => state.categories);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchChallengeStats());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Calculate total words learned across all categories
  const totalWordsLearned = user?.progress?.reduce((total, item) => {
    return total + (item.completedWords?.length || 0);
  }, 0) || 0;

  // Prepare data for the pie chart
  const pieData = {
    labels: ['Correct Answers', 'Wrong Answers'],
    datasets: [
      {
        data: [stats?.totalCorrect || 0, stats?.totalWrong || 0],
        backgroundColor: ['#4ade80', '#f87171'],
        borderColor: ['#16a34a', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for the bar chart
  const barData = {
    labels: categories?.map(category => category.name) || [],
    datasets: [
      {
        label: 'Words Learned',
        data: categories?.map(category => {
          const progressForCategory = user?.progress?.find(
            p => p.category === category._id
          );
          return progressForCategory?.completedWords?.length || 0;
        }) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
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
  };

  if (statsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Learning Progress 📊</h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Words Learned</h3>
          <p className="text-3xl font-bold text-indigo-600">{totalWordsLearned}</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Challenge Accuracy</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {stats?.totalAttempts 
              ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100) 
              : 0}%
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Daily Streak</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats?.currentStreak || 0} days</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Challenge Results</h3>
          <div className="w-full h-64 flex items-center justify-center">
            {stats?.totalAttempts > 0 ? (
              <Pie data={pieData} />
            ) : (
              <p className="text-gray-500">No challenge data available yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Progress</h3>
          <div className="w-full h-64">
            {categories?.length > 0 && totalWordsLearned > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No category progress available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learning Achievements */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'First Word', icon: '🔤', unlocked: totalWordsLearned >= 1 },
            { name: 'Word Collector', icon: '📚', unlocked: totalWordsLearned >= 10 },
            { name: 'Vocabulary Master', icon: '🧠', unlocked: totalWordsLearned >= 25 },
            { name: 'Perfect Challenge', icon: '🎯', unlocked: stats?.perfectChallenges > 0 },
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
    </div>
  );
};

export default Progress; 