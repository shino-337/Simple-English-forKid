import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchDailyChallenge, submitChallengeAnswer, incrementDailyAttempt, incrementDailyMistake } from '../store/slices/challengeSlice';
import toast from 'react-hot-toast';

const Challenge = () => {
  const dispatch = useDispatch();
  const { currentChallenge, dailyAttempts, dailyMistakes, isLoading, error } = useSelector((state) => ({
    ...state.challenges,
    dailyAttempts: state.challenges.dailyAttempts,
    dailyMistakes: state.challenges.dailyMistakes
  }));
  const [selectedWord, setSelectedWord] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    dispatch(fetchDailyChallenge());
  }, [dispatch]);

  if (error) {
    toast.error(error);
  }

  const handleSelectWord = (word) => {
    if (showResult) return;
    setSelectedWord(word);
  };

  const handleSubmit = async () => {
    if (!selectedWord) {
      toast.error('Please select a word first!');
      return;
    }

    dispatch(incrementDailyAttempt());
    
    const correctAnswer = currentChallenge.correctWord._id === selectedWord._id;
    setIsCorrect(correctAnswer);
    setShowResult(true);

    if (!correctAnswer) {
      dispatch(incrementDailyMistake());
    }

    // Submit the answer to the backend after a delay to show the result
    setTimeout(async () => {
      await dispatch(submitChallengeAnswer({
        selectedWordId: selectedWord._id,
        isCorrect: correctAnswer
      }));
      
      // Reset state and get a new challenge
      setSelectedWord(null);
      setShowResult(false);
      setIsCorrect(null);
      
      // Fetch a new challenge
      dispatch(fetchDailyChallenge());
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Daily Challenge 🎯</h2>
        <div className="bg-indigo-50 p-4 rounded-lg mb-6">
          <p className="text-sm font-medium text-indigo-800">
            Today's Progress: {dailyAttempts} attempts, {dailyMistakes} mistakes
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : currentChallenge ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Which word matches this picture?</h3>
              <div className="w-full max-w-sm mx-auto h-40 flex items-center justify-center">
                <img 
                  src={currentChallenge.targetWord.imageUrl} 
                  alt="Challenge" 
                  className="max-h-full max-w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {currentChallenge.options.map((word) => (
                <motion.button
                  key={word._id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectWord(word)}
                  className={`p-4 rounded-lg text-center transition-all ${
                    selectedWord?._id === word._id
                      ? 'bg-indigo-100 border-2 border-indigo-500'
                      : 'bg-gray-50 border border-gray-200'
                  } ${
                    showResult && word._id === currentChallenge.correctWord._id
                      ? 'bg-green-100 border-2 border-green-500'
                      : showResult && selectedWord?._id === word._id && word._id !== currentChallenge.correctWord._id
                      ? 'bg-red-100 border-2 border-red-500'
                      : ''
                  }`}
                >
                  <h4 className="font-medium text-gray-900 text-lg">{word.word}</h4>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={showResult}
                className="btn disabled:opacity-50"
              >
                {showResult ? (isCorrect ? 'Correct! 🎉' : 'Try Again 😢') : 'Check Answer'}
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600 py-12">
            <p className="text-xl">You've completed all challenges for today!</p>
            <p className="mt-2">Come back tomorrow for more.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Challenge; 