import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCategories } from '../store/slices/categorySlice';
import { fetchWordsByCategory, markWordAsLearned } from '../store/slices/wordSlice';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { WORD_IMAGES } from '../config';
import useSound from 'use-sound';

const Study = () => {
  const dispatch = useDispatch();
  const { categories, isLoading: categoriesLoading } = useSelector((state) => state.categories);
  const { words, isLoading: wordsLoading } = useSelector((state) => state.words);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [playSound] = useSound('/sounds/flip.mp3');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchWordsByCategory(selectedCategory._id));
      setCurrentWordIndex(0);
      setIsFlipped(false);
    }
  }, [selectedCategory, dispatch]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    playSound();
  };

  const handleNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setIsFlipped(false);
      playSound();
    } else {
      // Completed all words in the category
      triggerConfetti();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedCategory(null);
      }, 3000);
    }
  };

  const handlePrevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setIsFlipped(false);
      playSound();
    }
  };

  const handleMarkAsLearned = () => {
    if (words[currentWordIndex]) {
      dispatch(markWordAsLearned(words[currentWordIndex]._id));
      toast.success('Great job! Word marked as learned! ✓');
      playSound();
      handleNextWord();
    }
  };

  const playPronunciation = () => {
    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    // Use speech synthesis for pronunciation
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = 0.8; // Slightly slower for kids
    window.speechSynthesis.speak(utterance);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    playSound();
  };

  // Fun animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cardVariants = {
    hover: { 
      scale: 1.05, 
      boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  };

  const getImageUrl = (word) => {
    if (!word) return null;
    
    // Use Pixabay image URL if available
    if (word.imageUrl) {
      return word.imageUrl;
    }
    
    // Fallback to Unsplash if no Pixabay image
    return `https://source.unsplash.com/300x300/?${word.word}`;
  };

  const WordCard = ({ word }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [playSound] = useSound('/sounds/flip.mp3');

    const handleFlip = () => {
      setIsFlipped(!isFlipped);
      playSound();
    };

    return (
      <div className={`word-card ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
        <div className="word-card-inner">
          <div className="word-card-front">
            <div className="word-image">
              <img 
                src={getImageUrl(word)}
                alt={word.word}
                className="rounded-full w-32 h-32 object-cover"
                onError={() => setImageError(true)}
              />
            </div>
            <h3 className="word-name">{word.word}</h3>
          </div>
          <div className="word-card-back">
            <p className="word-meaning">{word.meaning}</p>
            <p className="word-example">{word.example}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-indigo-700 font-comic tracking-wide">
          Let's Learn English! 🌟
        </h1>

        <AnimatePresence mode="wait">
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-lg mb-8 text-center"
            >
              <h2 className="text-3xl font-bold mb-2">Hooray! 🎉</h2>
              <p className="text-xl">You completed all the words in this category!</p>
            </motion.div>
          )}

          {!selectedCategory ? (
            // Categories view
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-purple-700">
                Choose a fun category to start! 🚀
              </h2>
              
              {categoriesLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-bounce text-5xl">🔄</div>
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {categories.map((category) => (
                    <motion.div
                      key={category.id}
                      variants={itemVariants}
                      whileHover="hover"
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <motion.div 
                        className="bg-white rounded-3xl overflow-hidden shadow-lg border-4 border-yellow-400 h-full"
                        variants={cardVariants}
                      >
                        <div className="p-1">
                          <img 
                            src={category.imageUrl || `https://source.unsplash.com/300x200/?${category.name}`} 
                            alt={category.name}
                            className="w-full h-40 object-cover rounded-2xl"
                          />
                        </div>
                        <div className="px-4 py-5 text-center">
                          <h3 className="text-2xl font-bold text-indigo-600 mb-2">{category.name}</h3>
                          <p className="text-gray-600">{category.description || `Learn fun ${category.name} words!`}</p>
                          <div className="mt-4 bg-indigo-100 rounded-full py-2 text-indigo-800 font-semibold">
                            {category.wordCount || '10'} words to learn
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          ) : (
            // Vocabulary learning view
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(null)}
                  className="bg-indigo-600 text-white rounded-full px-6 py-2 flex items-center text-lg font-bold shadow-md"
                >
                  <span className="mr-2">←</span> Back to Categories
                </motion.button>
                <h2 className="text-2xl font-bold text-indigo-700">{selectedCategory.name}</h2>
              </div>

              {wordsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-bounce text-5xl">🔄</div>
                </div>
              ) : words.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-3xl shadow-md">
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">No words found in this category</h3>
                  <p className="text-gray-600">Check back later for new words!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Progress indicator */}
                  <div className="bg-white rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className="bg-green-400 h-full transition-all duration-300"
                      style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-lg font-bold text-indigo-700">
                    Word {currentWordIndex + 1} of {words.length}
                  </div>

                  {/* Flashcard */}
                  <div className="flex justify-center perspective">
                    <motion.div
                      key={`flashcard-${currentWordIndex}`}
                      className={`w-full max-w-md h-80 cursor-pointer relative preserve-3d transition-all duration-500 ${isFlipped ? 'y-180' : ''}`}
                      onClick={flipCard}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Front face */}
                      <div className={`absolute w-full h-full backface-hidden rounded-3xl shadow-xl overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 p-6 flex flex-col items-center justify-between`}>
                        <h3 className="text-3xl font-bold text-white">{words[currentWordIndex]?.word}</h3>
                        
                        <div className="relative w-48 h-48 bg-white rounded-full p-3 shadow-inner">
                          <img 
                            src={getImageUrl(words[currentWordIndex])}
                            alt={words[currentWordIndex]?.word}
                            className="w-full h-full object-contain rounded-full"
                            onError={(e) => {
                              // Fallback to Unsplash if Pixabay image fails
                              e.target.src = `https://source.unsplash.com/300x300/?${words[currentWordIndex]?.word}`;
                            }}
                          />
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playPronunciation();
                          }}
                          className="text-white hover:text-yellow-200 text-4xl transition-colors"
                        >
                          🔊
                        </button>
                      </div>

                      {/* Back face */}
                      <div className={`absolute w-full h-full backface-hidden rounded-3xl shadow-xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 p-6 flex flex-col items-center justify-between y-180`}>
                        <h3 className="text-3xl font-bold text-white mb-4">{words[currentWordIndex]?.translation}</h3>
                        
                        <div className="space-y-4 text-white text-center">
                          <h4 className="text-xl font-semibold mb-2">Examples:</h4>
                          {words[currentWordIndex]?.examples?.map((example, index) => (
                            <div key={index} className="bg-white/20 p-3 rounded-lg">
                              <p className="mb-1">{example.sentence}</p>
                              <p className="text-yellow-200">{example.translation}</p>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsLearned();
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-colors"
                        >
                          I Know This! ✓
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex justify-between items-center">
                    <motion.button
                      key="prev-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevWord}
                      disabled={currentWordIndex === 0}
                      className={`bg-blue-500 text-white rounded-full px-6 py-3 flex items-center text-lg font-bold shadow-md ${currentWordIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                    >
                      <span className="mr-2">←</span> Previous
                    </motion.button>
                    
                    <motion.button
                      key="learn-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleMarkAsLearned}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-3 text-lg font-bold shadow-md"
                    >
                      I've Learned This! ✓
                    </motion.button>
                    
                    <motion.button
                      key="next-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextWord}
                      disabled={currentWordIndex === words.length - 1}
                      className={`bg-blue-500 text-white rounded-full px-6 py-3 flex items-center text-lg font-bold shadow-md ${currentWordIndex === words.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                    >
                      Next <span className="ml-2">→</span>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Study; 