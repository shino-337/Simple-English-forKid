import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCategories } from '../store/slices/categorySlice';
import { fetchWordsByCategory, markWordAsLearned } from '../store/slices/wordSlice';
import { recordStudySession } from '../store/slices/progressSlice';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
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
  
  // Sound effects
  const [playFlipSound] = useSound('/sounds/flip.mp3');
  const [playSuccessSound] = useSound('/sounds/success.mp3', { volume: 0.5 });
  const [playCompletionSound] = useSound('/sounds/completion.mp3', { volume: 0.7 });
  
  // Track study session data
  const [studiedWords, setStudiedWords] = useState([]);
  const [learnedWords, setLearnedWords] = useState([]);
  const sessionStartTimeRef = useRef(null);
  const studyTimeRef = useRef(0);
  
  // Timer to track study time
  const timerRef = useRef(null);
  
  // Create refs at the top level
  const audioElementRef = useRef(null);
  const confettiTimeoutRef = useRef(null);
  const containersRef = useRef([]);
  
  // Create refs to track resources
  const audioElementsRef = useRef([]);
  const timeoutIdsRef = useRef([]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchWordsByCategory(selectedCategory._id));
      setCurrentWordIndex(0);
      setIsFlipped(false);
      
      // Reset study session data
      setStudiedWords([]);
      setLearnedWords([]);
      sessionStartTimeRef.current = Date.now();
      studyTimeRef.current = 0;
      
      // Start timer to track study time
      timerRef.current = setInterval(() => {
        studyTimeRef.current += 1;
      }, 1000);
    } else {
      // Clear timer when no category is selected
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedCategory, dispatch]);

  // Add current word to studied words when changing words
  useEffect(() => {
    if (selectedCategory && words.length > 0 && currentWordIndex < words.length) {
      const currentWord = words[currentWordIndex];
      if (currentWord && !studiedWords.includes(currentWord._id)) {
        setStudiedWords(prev => [...prev, currentWord._id]);
      }
    }
  }, [currentWordIndex, words, selectedCategory, studiedWords]);

  // Update triggerConfetti to properly track and clean up DOM elements
  const triggerConfetti = useCallback(() => {
    // Original confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Add emoji confetti
    const emojis = ['🎉', '⭐', '🌟', '✨', '🎊', '🎈', '🏆', '🥇'];
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    // Track the container for cleanup
    containersRef.current.push(container);
    
    // Create emoji elements
    for (let i = 0; i < 20; i++) {
      const emoji = document.createElement('div');
      emoji.className = 'confetti';
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.left = Math.random() * 100 + 'vw';
      emoji.style.fontSize = (Math.random() * 20 + 10) + 'px';
      emoji.style.opacity = Math.random() * 0.5 + 0.5;
      
      // Add animation class
      const animationClass = i % 3 === 0 
        ? 'confetti--animation-slow' 
        : i % 3 === 1 
          ? 'confetti--animation-medium' 
          : 'confetti--animation-fast';
      emoji.classList.add(animationClass);
      
      container.appendChild(emoji);
    }
    
    // Remove container after animations complete
    confettiTimeoutRef.current = setTimeout(() => {
      // Clean up timer
      confettiTimeoutRef.current = null;
      
      // Clean up container
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
        
        // Remove from containers ref
        containersRef.current = containersRef.current.filter(c => c !== container);
      }
    }, 3000);
  }, []);

  // Optimize category select handler with useCallback
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    playFlipSound();
  }, [playFlipSound]);

  // Optimize word navigation with useCallback
  const handleNextWord = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setIsFlipped(false);
      playFlipSound();
    } else {
      // Completed all words in the category
      triggerConfetti();
      playCompletionSound(); // Play completion sound
      setShowSuccess(true);
      
      // Record study session when completing a category
      if (selectedCategory && studiedWords.length > 0) {
        const sessionData = {
          categoryId: selectedCategory._id,
          wordsStudied: studiedWords,
          wordsLearned: learnedWords,
          timeSpent: studyTimeRef.current
        };
        
        dispatch(recordStudySession(sessionData));
      }
      
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedCategory(null);
      }, 3000);
    }
  }, [
    currentWordIndex, 
    words.length, 
    playFlipSound, 
    triggerConfetti, 
    playCompletionSound, 
    selectedCategory, 
    studiedWords, 
    learnedWords, 
    studyTimeRef, 
    dispatch
  ]);

  const handlePrevWord = useCallback(() => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
      setIsFlipped(false);
      playFlipSound();
    }
  }, [currentWordIndex, playFlipSound]);

  const handleMarkAsLearned = useCallback(() => {
    if (words[currentWordIndex]) {
      const wordId = words[currentWordIndex]._id;
      dispatch(markWordAsLearned(wordId));
      
      // Add to learned words list
      if (!learnedWords.includes(wordId)) {
        setLearnedWords(prev => [...prev, wordId]);
      }
      
      // Play success sound
      playSuccessSound();
      
      toast.success('Great job! Word marked as learned! ✓');
      handleNextWord();
    }
  }, [words, currentWordIndex, dispatch, learnedWords, playSuccessSound, handleNextWord]);

  const playPronunciation = useCallback(() => {
    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    // Use speech synthesis for pronunciation
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = 0.8; // Slightly slower for kids
    utterance.volume = 1.0; // Maximum volume for text-to-speech as well
    window.speechSynthesis.speak(utterance);
  }, [words, currentWordIndex]);

  // Memoize the getImageUrl function
  const getImageUrl = useCallback((word) => {
    if (!word || !word.imageUrl) {
      console.log('No image URL available for word:', word?.word || 'unknown');
      return null;
    }
    
    // Log the original image URL for debugging
    console.log(`Original image URL for ${word.word}:`, word.imageUrl);
    
    // Use uploaded image if available
    if (word.imageUrl) {
      // If it's a relative path, prepend the API URL
      if (word.imageUrl.startsWith('/')) {
        // Use window._env_ if available, or fallback to hardcoded URL
        const apiUrl = (window._env_ && window._env_.REACT_APP_API_URL) || 'http://localhost:5001';
        // Ensure the path is correctly formatted for the server static file serving
        const fullUrl = `${apiUrl}${word.imageUrl}`;
        console.log(`Full image URL for ${word.word}:`, fullUrl);
        return fullUrl;
      }
      return word.imageUrl;
    }
    
    // Fallback to placeholder with word text
    return `https://via.placeholder.com/300x300?text=${encodeURIComponent(word.word)}`;
  }, []);

  // Memoize the getCategoryColorBlock function
  const getCategoryColorBlock = useCallback((category) => {
    if (!category) return '#4F46E5'; // Default indigo color
    
    // Use category color if available, otherwise use default
    return category.color || '#4F46E5';
  }, []);

  // Memoize the playWordAudio function - moved useRef to component top level
  const playWordAudio = useCallback((e, word) => {
    e.stopPropagation(); // Prevent card flip when clicking the audio button
    
    if (!word) {
      console.log('No word provided for audio playback');
      return;
    }
    
    // If word has audio URL, play it
    if (word.audioUrl) {
      console.log(`Original audio URL for ${word.word}:`, word.audioUrl);
      
      // If it's a relative path, prepend the API URL
      const audioSrc = word.audioUrl.startsWith('/') 
        ? `${(window._env_ && window._env_.REACT_APP_API_URL) || 'http://localhost:5001'}${word.audioUrl}`
        : word.audioUrl;
      
      console.log(`Full audio URL for ${word.word}:`, audioSrc);
      
      // Clean up any existing audio
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      
      audioElementRef.current = new Audio(audioSrc);
      // Increase volume for word audio playback
      audioElementRef.current.volume = 1.0; // Maximum volume
      audioElementRef.current.play().catch(error => {
        console.error(`Error playing audio for ${word.word}:`, error);
        toast.error('Could not play audio');
        
        // Fall back to speech synthesis if audio file fails
        useSpeechSynthesis(word.word);
      });
      
      // Track the audio element for cleanup
      audioElementsRef.current.push(audioElementRef.current);
      
      // Clean up the audio when finished
      audioElementRef.current.onended = () => {
        if (audioElementRef.current) {
          audioElementRef.current.src = '';
          
          // Remove from tracked audio elements
          audioElementsRef.current = audioElementsRef.current.filter(audio => audio !== audioElementRef.current);
          
          audioElementRef.current = null;
        }
      };
    } else {
      // Fall back to speech synthesis if no audio URL is available
      useSpeechSynthesis(word.word);
    }
  }, []);

  // Helper function for speech synthesis
  const useSpeechSynthesis = useCallback((text) => {
    if (!text) return;
    
    // Use speech synthesis as fallback
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // Slightly slower for kids
    utterance.volume = 1.0; // Maximum volume
    window.speechSynthesis.speak(utterance);
    
    toast.info('Using text-to-speech for pronunciation');
  }, []);

  // Add comprehensive cleanup effect
  useEffect(() => {
    // Cleanup function to be called on unmount
    return () => {
      // Clean up any audio elements
      audioElementsRef.current.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
          audio.load();
        }
      });
      
      // Clear any timeouts
      timeoutIdsRef.current.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      
      // Clean up specific refs
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
      
      // Cancel any speech synthesis
      window.speechSynthesis.cancel();
      
      // Remove any confetti containers
      containersRef.current.forEach(container => {
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      });
      
      // Also check for any remaining containers
      const confettiContainers = document.querySelectorAll('.confetti-container');
      confettiContainers.forEach(container => {
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      });
    };
  }, []);

  // Use useMemo for animation variants
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }), []);

  const cardVariants = useMemo(() => ({
    hover: { 
      scale: 1.05, 
      boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 }
    }
  }), []);

  // Use useMemo for computing properties of the current word
  const currentWord = useMemo(() => {
    if (words.length > 0 && currentWordIndex < words.length) {
      return words[currentWordIndex];
    }
    return null;
  }, [words, currentWordIndex]);

  // Helper function to format time (seconds -> MM:SS)
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Add back the flipCard function that got deleted
  const flipCard = useCallback(() => {
    setIsFlipped(!isFlipped);
    playFlipSound();
  }, [isFlipped, playFlipSound]);

  // Use useMemo for formatting study session stats
  const sessionStats = useMemo(() => {
    return {
      wordsStudied: studiedWords.length,
      wordsLearned: learnedWords.length,
      completionPercentage: words.length > 0 
        ? Math.round((currentWordIndex + 1) / words.length * 100)
        : 0,
      timeSpent: formatTime(studyTimeRef.current)
    };
  }, [studiedWords, learnedWords, words.length, currentWordIndex, studyTimeRef.current, formatTime]);

  // Add a function to get appropriate background icon based on category name
  const getCategoryIcon = useCallback((categoryName) => {
    const name = categoryName.toLowerCase();
    // Map category names to appropriate emoji/icon
    if (name.includes('card') || name.includes('flash')) return '♠️';
    if (name.includes('action') || name.includes('verb')) return '🛡️';
    if (name.includes('arcade') || name.includes('game')) return '🎮';
    if (name.includes('sport')) return '🏀';
    if (name.includes('simulation') || name.includes('sim')) return '🏔️';
    if (name.includes('adventure')) return '🏆';
    if (name.includes('animal')) return '🐾';
    if (name.includes('food')) return '🍎';
    if (name.includes('number')) return '🔢';
    if (name.includes('color')) return '🎨';
    if (name.includes('body')) return '👋';
    if (name.includes('cloth')) return '👕';
    // Default icon if no match
    return '📚';
  }, []);

  // Get gradient background based on category
  const getCategoryGradient = useCallback((index) => {
    // Array of gradient styles for categories
    const gradients = [
      'from-purple-400 to-purple-500', // Purple
      'from-orange-400 to-orange-500', // Orange
      'from-pink-400 to-pink-500',     // Pink
      'from-blue-400 to-blue-500',     // Blue
      'from-green-400 to-green-500',   // Green
      'from-yellow-400 to-yellow-500', // Yellow
      'from-red-400 to-red-500',       // Red
      'from-indigo-400 to-indigo-500', // Indigo
      'from-teal-400 to-teal-500',     // Teal
      'from-cyan-400 to-cyan-500',     // Cyan
    ];
    return gradients[index % gradients.length];
  }, []);

  // Add memoization for rendered components
  const CategoryList = useMemo(() => {
    return (
      <motion.div
        className="category-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category, index) => (
          <motion.div
            key={category._id}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03,
              y: -5,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.97 }}
            className={`category-card relative rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 h-36`}
            onClick={() => handleCategorySelect(category)}
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getCategoryGradient(index)}`}></div>
            
            {/* Background icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <span className="text-white text-9xl">{getCategoryIcon(category.name)}</span>
            </div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-4">
              <h3 className="text-2xl font-bold text-white text-center tracking-wide font-baloo">
                {category.name}
              </h3>
              
              {/* Optional description - only show if short */}
              {category.description && category.description.length < 30 && (
                <p className="text-white text-opacity-80 text-center mt-2 text-sm font-comic">
                  {category.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }, [categories, containerVariants, itemVariants, handleCategorySelect, getCategoryGradient, getCategoryIcon]);

  const WordCard = useMemo(() => {
    if (!currentWord) return null;
    
    return (
      <motion.div 
        className="word-card-container w-full max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left panel - Word Image */}
          <motion.div 
            className="word-image-card bg-gradient-to-b from-indigo-50 to-purple-100 rounded-3xl shadow-lg border-4 border-indigo-200 p-6 transform transition-all duration-300 hover:shadow-xl"
            whileHover={{ 
              scale: 1.02, 
              boxShadow: "0 10px 25px rgba(99, 102, 241, 0.2)",
              y: -5
            }}
          >
            {/* Decorative elements */}
            <div className="absolute -top-3 -right-3 text-3xl transform rotate-12 z-10">✨</div>
            <div className="absolute -bottom-3 -left-3 text-3xl transform -rotate-12 z-10">✨</div>
            
            {/* Image container - refined to handle different image aspect ratios */}
            <div className="img-container flex justify-center items-center mb-6 rounded-2xl overflow-hidden border-4 border-indigo-200 p-3 bg-white h-56 sm:h-64">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={getImageUrl(currentWord)}
                  alt={currentWord.word}
                  className="w-full h-full object-contain sm:object-cover md:object-contain"
                  style={{ objectPosition: 'center' }}
                  onError={() => setImageError(true)}
                />
                
                {/* Fun character pointing at the image */}
                <div className="absolute bottom-2 right-2 text-3xl transform rotate-12 animate-bounce-light">
                  {['🐵', '🦁', '🐰', '🐼', '🐻'][Math.floor(Math.random() * 5)]}
                </div>
              </div>
            </div>
            
            {/* Word label */}
            <div className="word-label-container">
              <h2 className="word-title text-3xl font-bold text-center text-indigo-700 py-3 px-6 bg-white rounded-full border-2 border-indigo-200 font-baloo shadow-sm">
                {currentWord.word}
              </h2>
            </div>
            
            {/* Audio button - modified to play actual audio file */}
            <button 
              className="audio-btn mt-4 bg-gradient-to-r from-pink-400 to-purple-500 text-white py-3 px-6 rounded-full shadow-md flex items-center justify-center mx-auto transform hover:scale-105 transition-all duration-300"
              onClick={(e) => playWordAudio(e, currentWord)}
            >
              <span className="text-lg mr-2">🔊</span> Listen
            </button>
          </motion.div>
          
          {/* Right panel - Word Details */}
          <motion.div 
            className="word-details-card bg-gradient-to-b from-blue-50 to-cyan-100 rounded-3xl shadow-lg border-4 border-blue-200 p-6 transform transition-all duration-300 hover:shadow-xl"
            whileHover={{ 
              scale: 1.02, 
              boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
              y: -5
            }}
          >
            {/* Decorative elements */}
            <div className="absolute -top-3 -left-3 text-3xl transform rotate-12 z-10">🔤</div>
            <div className="absolute -bottom-3 -right-3 text-3xl transform -rotate-12 z-10">📚</div>
            
            {/* Word information container */}
            <div className="word-info space-y-4">
              <div className="meaning-container">
                <h3 className="meaning-title text-2xl font-bold text-blue-600 mb-2 font-baloo flex items-center">
                  <span className="text-2xl mr-2">💡</span> Meaning:
                </h3>
                <div className="meaning-text bg-white p-4 rounded-xl border-2 border-blue-100 text-gray-700 font-comic shadow-sm text-lg">
                  {currentWord.meaning}
                </div>
              </div>
              
              {currentWord.example && (
                <div className="example-container mt-4">
                  <h3 className="example-title text-2xl font-bold text-blue-600 mb-2 font-baloo flex items-center">
                    <span className="text-2xl mr-2">🗣️</span> Example:
                  </h3>
                  <div className="example-text bg-white p-4 rounded-xl border-2 border-blue-100 text-gray-700 font-comic italic shadow-sm text-lg">
                    "{currentWord.example}"
                  </div>
                </div>
              )}
              
              {/* Fun fact or hint */}
              <div className="hint-container mt-4">
                <div className="hint-text bg-yellow-50 p-4 rounded-xl border-2 border-dashed border-yellow-200 text-yellow-700 font-comic text-lg flex items-start">
                  <span className="text-2xl mr-2 mt-1">💫</span>
                  <span>
                    Try using this word in your own sentence!
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }, [currentWord, getImageUrl, playWordAudio]);

  const WordProgress = useMemo(() => {
    if (!words.length) return null;
    
    return (
      <div className="word-progress mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-indigo-700 font-bold font-baloo">
            <span className="text-xl mr-2">📚</span> Learning Progress
          </span>
          <span className="text-indigo-700 font-bold font-baloo">
            {currentWordIndex + 1} of {words.length}
            <span className="text-xl ml-2">📝</span>
          </span>
        </div>
        
        <div className="progress-bar h-5 bg-indigo-100 rounded-full overflow-hidden border-2 border-indigo-200 shadow-inner">
          <div 
            className="progress-fill h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-end pr-2 transition-all duration-500 ease-out"
            style={{ width: `${sessionStats.completionPercentage}%` }}
          >
            {sessionStats.completionPercentage > 10 && (
              <span className="text-white text-xs font-bold">
                {sessionStats.completionPercentage}%
              </span>
            )}
          </div>
        </div>
        
        {/* Add session stats display */}
        <div className="mt-3 flex flex-wrap justify-between text-sm">
          <div className="bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 border border-indigo-100 mb-2">
            <span className="font-semibold">Time:</span> {sessionStats.timeSpent}
          </div>
          <div className="bg-purple-50 px-3 py-1 rounded-full text-purple-700 border border-purple-100 mb-2">
            <span className="font-semibold">Words Studied:</span> {sessionStats.wordsStudied}
          </div>
          <div className="bg-pink-50 px-3 py-1 rounded-full text-pink-700 border border-pink-100 mb-2">
            <span className="font-semibold">Words Learned:</span> {sessionStats.wordsLearned}
          </div>
        </div>
      </div>
    );
  }, [words.length, currentWordIndex, sessionStats]);

  return (
    <div className="min-h-screen bg-kid-gradient p-4 sm:p-6 relative">
      {/* Add floating clouds in the background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-white opacity-70"
            style={{
              fontSize: `${Math.random() * 40 + 60}px`,
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 60}%`,
              animation: `float ${Math.random() * 10 + 20}s linear infinite`,
              animationDelay: `${Math.random() * -10}s`,
            }}
          >
            {['☁️', '🌥️', '🌤️'][Math.floor(Math.random() * 3)]}
          </div>
        ))}
        
        {/* Add a rainbow */}
        <div 
          className="absolute text-6xl"
          style={{
            right: '5%',
            top: '15%',
            animation: 'float 15s ease-in-out infinite',
          }}
        >
          🌈
        </div>
        
        {/* Add some birds */}
        <div 
          className="absolute text-4xl"
          style={{
            left: '10%',
            top: '10%',
            animation: 'float 25s linear infinite',
          }}
        >
          🐦
        </div>
        <div 
          className="absolute text-3xl"
          style={{
            left: '15%',
            top: '15%',
            animation: 'float 20s linear infinite',
            animationDelay: '-5s',
          }}
        >
          🐦
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 font-baloo tracking-wide">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 drop-shadow-sm">
              Let's Learn English!
            </span>
            <span className="ml-4 inline-block animate-bounce">🌟</span>
          </h1>
          
          {/* Add decorative elements around the title */}
          <div className="absolute -top-6 -left-6 text-4xl animate-float" style={{ animationDelay: '-2s' }}>✨</div>
          <div className="absolute -bottom-6 -right-6 text-4xl animate-float" style={{ animationDelay: '-1s' }}>✨</div>
          <div className="absolute top-1/2 -translate-y-1/2 -left-12 text-5xl hidden lg:block animate-float" style={{ animationDelay: '-3s' }}>🎈</div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-12 text-5xl hidden lg:block animate-float" style={{ animationDelay: '-4s' }}>🎈</div>
        </div>

        <AnimatePresence mode="wait">
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-green-300 to-green-400 p-8 rounded-3xl mb-8 text-center shadow-xl border-4 border-yellow-300 relative overflow-hidden"
            >
              {/* Animated stars in the background */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute text-yellow-300"
                    style={{
                      fontSize: `${Math.random() * 20 + 10}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `pulse-gentle ${Math.random() * 2 + 1}s ease-in-out infinite`,
                      animationDelay: `${Math.random() * 2}s`,
                      transform: `rotate(${Math.random() * 360}deg)`
                    }}
                  >
                    ⭐
                  </div>
                ))}
              </div>
              
              <motion.h2 
                className="text-4xl font-bold mb-4 text-white font-baloo drop-shadow-md relative z-10"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                Hooray! You did it! 🎉
              </motion.h2>
              
              <motion.p 
                className="text-2xl text-white font-comic relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                You completed all the words in this category!
              </motion.p>
              
              <motion.div
                className="mt-6 relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="inline-block bg-yellow-300 text-indigo-800 font-bold py-3 px-6 rounded-full shadow-lg animate-bounce-light">
                  <span className="text-2xl mr-2">🏆</span> Great job!
                </div>
              </motion.div>
            </motion.div>
          )}

          {!selectedCategory ? (
            // Categories view
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-purple-600 font-baloo animate-bounce-light">
                Choose a fun category to start! 🚀
              </h2>
              
              {categoriesLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-bounce text-6xl">🔄</div>
                </div>
              ) : (
                CategoryList
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
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full px-6 py-3 flex items-center text-lg font-bold shadow-md touch-target"
                >
                  <span className="mr-2">←</span> Back to Categories
                </motion.button>
                <h2 className="text-2xl font-bold text-indigo-600 font-comic">{selectedCategory.name}</h2>
              </div>

              {wordsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-bounce text-5xl">🔄</div>
                </div>
              ) : words.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-3xl shadow-md border-4 border-yellow-300">
                  <h3 className="text-2xl font-bold text-gray-700 mb-4 font-comic">No words found in this category</h3>
                  <p className="text-gray-600">Check back later for new words!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Progress indicator */}
                  {WordProgress}

                  {/* Flashcard */}
                  <div className="flex justify-center">
                    {WordCard}
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex flex-wrap justify-center items-center mt-8 gap-4">
                    <motion.button
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 8px 15px rgba(37, 99, 235, 0.25)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrevWord}
                      disabled={currentWordIndex === 0}
                      className={`nav-btn bg-gradient-to-r from-blue-400 to-blue-500 text-white py-4 px-7 rounded-2xl font-bold shadow-md flex items-center justify-center min-w-[150px] transition-all ${currentWordIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3 animate-pulse">⬅️</span> 
                        <span className="font-baloo text-lg">Previous</span>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 8px 20px rgba(5, 150, 105, 0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleMarkAsLearned}
                      className="nav-btn bg-gradient-to-r from-green-400 to-emerald-500 text-white py-4 px-8 rounded-2xl font-bold shadow-md flex items-center justify-center min-w-[220px] hover:shadow-lg transition-all border-2 border-green-300"
                    >
                      <div className="flex items-center">
                        <span className="mr-2 text-2xl animate-bounce-light">🌟</span>
                        <span className="font-baloo text-lg">I've Learned This!</span>
                        <span className="ml-2 text-xl bg-white text-green-500 rounded-full h-7 w-7 flex items-center justify-center">✓</span>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 8px 15px rgba(79, 70, 229, 0.25)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextWord}
                      disabled={currentWordIndex === words.length - 1}
                      className={`nav-btn bg-gradient-to-r from-indigo-400 to-indigo-500 text-white py-4 px-7 rounded-2xl font-bold shadow-md flex items-center justify-center min-w-[150px] transition-all ${currentWordIndex === words.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                    >
                      <div className="flex items-center">
                        <span className="font-baloo text-lg">Next</span>
                        <span className="ml-3 text-2xl animate-pulse">➡️</span>
                      </div>
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