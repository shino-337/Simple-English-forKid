import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { 
  fetchLearnedWords, 
  getDailyChallengeStatus, 
  startNewChallenge, 
  checkAnswer, 
  resetChallengeState,
  markWordForReview,
  recordChallengeProgress,
  fetchChallengeStats
} from '../store/slices/challengeSlice';
import { refreshProgressStatsQuiet } from '../store/slices/progressSlice';

const Challenge = () => {
  const dispatch = useDispatch();
  const { 
    learnedWords, 
    currentChallenge, 
    dailyStatus, 
    wordsForReview, 
    isLoading 
  } = useSelector((state) => state.challenges);
  
  // Create refs for sound effects instead of useSound
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const completeSoundRef = useRef(null);
  const transitionSoundRef = useRef(null);
  
  // Add transition state for smoother challenge transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Add streak counter for gamification
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  
  // Initialize sound refs
  useEffect(() => {
    correctSoundRef.current = new Audio('/sounds/success.mp3');
    wrongSoundRef.current = new Audio('/sounds/flip.mp3');
    completeSoundRef.current = new Audio('/sounds/completion.mp3');
    transitionSoundRef.current = new Audio('/sounds/flip.mp3'); // Reuse flip sound for transitions
    
    // Increase volumes for better sound effect
    correctSoundRef.current.volume = 0.8;
    wrongSoundRef.current.volume = 1.0;
    completeSoundRef.current.volume = 0.9;
    transitionSoundRef.current.volume = 0.5;
    
    // Preload audio files to improve performance
    correctSoundRef.current.load();
    wrongSoundRef.current.load();
    completeSoundRef.current.load();
    transitionSoundRef.current.load();
    
    // Cleanup function
    return () => {
      correctSoundRef.current = null;
      wrongSoundRef.current = null;
      completeSoundRef.current = null;
      transitionSoundRef.current = null;
    };
  }, []);
  
  // Optimize sound effect functions with useCallback
  const playCorrect = useCallback(() => {
    try {
      if (correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play().catch(err => console.error('Error playing sound:', err));
      }
    } catch (error) {
      console.error('Error playing correct sound:', error);
    }
  }, []);
  
  const playWrong = useCallback(() => {
    try {
      if (wrongSoundRef.current) {
        wrongSoundRef.current.currentTime = 0;
        wrongSoundRef.current.play().catch(err => console.error('Error playing sound:', err));
      }
    } catch (error) {
      console.error('Error playing wrong sound:', error);
    }
  }, []);
  
  const playComplete = useCallback(() => {
    try {
      if (completeSoundRef.current) {
        completeSoundRef.current.currentTime = 0;
        completeSoundRef.current.play().catch(err => console.error('Error playing sound:', err));
      }
    } catch (error) {
      console.error('Error playing complete sound:', error);
    }
  }, []);
  
  const playTransition = useCallback(() => {
    try {
      if (transitionSoundRef.current) {
        transitionSoundRef.current.currentTime = 0;
        transitionSoundRef.current.play().catch(err => console.error('Error playing sound:', err));
      }
    } catch (error) {
      console.error('Error playing transition sound:', error);
    }
  }, []);
  
  // Refs to handle audio playback of target word
  const audioRef = useRef(null);
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  
  // State for selection
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [showComplete, setShowComplete] = useState(false);
  
  // Add these refs at the top level of the component
  const streakAnimationTimerRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const resultTimerRef = useRef(null);
  const resetTransitionTimerRef = useRef(null);
  const confettiTimerRef = useRef(null);
  const utteranceRef = useRef(null);
  
  // Load learned words and challenge status on component mount
  useEffect(() => {
    dispatch(fetchLearnedWords());
    dispatch(getDailyChallengeStatus());
  }, [dispatch]);
  
  // Start a new challenge when component mounts or when previous one completes
  useEffect(() => {
    if (learnedWords.length > 0 && !isLoading && !currentChallenge.displayedWords.length && dailyStatus.canChallenge) {
      dispatch(startNewChallenge());
    }
  }, [learnedWords, isLoading, currentChallenge.displayedWords, dailyStatus.canChallenge, dispatch]);
  
  // Handle challenge completion - record progress
  useEffect(() => {
    if (currentChallenge.completed && currentChallenge.targetWord) {
      // Record progress with the backend
      const progressData = {
        wordId: currentChallenge.targetWord._id,
        wasCorrect: currentChallenge.currentAttempt < 3,
        attempts: currentChallenge.currentAttempt
      };
      
      // Add error handling with a toast notification
      dispatch(recordChallengeProgress(progressData))
        .unwrap()
        .then(() => {
          // Refresh stats after successful challenge completion
          dispatch(refreshProgressStatsQuiet());
          dispatch(fetchChallengeStats());
        })
        .catch(error => {
          console.error('Error recording challenge progress:', error);
          toast.error('Failed to save your progress. Please try again.');
        });
      
      // If user got the word wrong 3 times, mark it for review
      if (currentChallenge.currentAttempt >= 3) {
        // Add error handling with a toast notification
        dispatch(markWordForReview(currentChallenge.targetWord._id))
          .unwrap()
          .catch(error => {
            console.error('Error marking word for review:', error);
            // Don't show another toast here as we already show one in the action
          });
      }
      
      // Show completion message if all daily challenges are done
      if (dailyStatus.remainingChallenges <= 0) {
        setShowComplete(true);
        playComplete();
        triggerConfetti();
      }
    }
  }, [currentChallenge.completed, currentChallenge.targetWord, currentChallenge.currentAttempt, 
      dailyStatus.remainingChallenges, dispatch, playComplete]);
  
  // Remove automatic audio playback when a new challenge starts
  // The audio will now only play when the user explicitly clicks the audio button
  
  // Optimize audio playback with useCallback
  const playTargetWordAudio = useCallback(() => {
    if (!currentChallenge.targetWord) return;
    
    setAudioIsPlaying(true);
    
    if (currentChallenge.targetWord.audioUrl) {
      // Play the stored audio file
      const audioSrc = currentChallenge.targetWord.audioUrl.startsWith('/') 
        ? `${(window._env_ && window._env_.REACT_APP_API_URL) || 'http://localhost:5001'}${currentChallenge.targetWord.audioUrl}`
        : currentChallenge.targetWord.audioUrl;
      
      if (!audioRef.current) {
        audioRef.current = new Audio(audioSrc);
      } else {
        audioRef.current.src = audioSrc;
      }
      
      // Increase volume for target word audio
      audioRef.current.volume = 1.0;
      
      audioRef.current.play()
        .then(() => {
          audioRef.current.onended = () => setAudioIsPlaying(false);
        })
        .catch(error => {
          console.error('Error playing audio:', error);
          setAudioIsPlaying(false);
          toast.error('Could not play audio');
          
          // Fallback to text-to-speech
          fallbackToTextToSpeech();
        });
    } else {
      // Fallback to text-to-speech
      fallbackToTextToSpeech();
    }
  }, [currentChallenge.targetWord]);
  
  const fallbackToTextToSpeech = useCallback(() => {
    if (!currentChallenge.targetWord) return;
    
    // Cancel any previous speech synthesis
    window.speechSynthesis.cancel();
    
    // Use speech synthesis for pronunciation
    const utterance = new SpeechSynthesisUtterance(currentChallenge.targetWord.word);
    utterance.rate = 0.8; // Slightly slower for kids
    utterance.onend = () => setAudioIsPlaying(false);
    
    // Store reference for cleanup
    utteranceRef.current = utterance;
    
    window.speechSynthesis.speak(utterance);
  }, [currentChallenge.targetWord, setAudioIsPlaying]);
  
  const handleWordSelect = useCallback((wordId) => {
    if (showResult) return;
    
    // Clear any existing timers first to prevent memory leaks
    if (streakAnimationTimerRef.current) clearTimeout(streakAnimationTimerRef.current);
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
    if (resetTransitionTimerRef.current) clearTimeout(resetTransitionTimerRef.current);
    
    setSelectedWordId(wordId);
    const isCorrect = wordId === currentChallenge.targetWord._id;
    
    dispatch(checkAnswer({ wordId }));
    
    // Show result animation
    setResult(isCorrect);
    setShowResult(true);
    
    if (isCorrect) {
      playCorrect();
      // Small confetti for correct answer
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Increment streak counter for correct answers
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      
      // Show streak animation for streaks of 2 or more
      if (newStreak >= 2) {
        setShowStreakAnimation(true);
        streakAnimationTimerRef.current = setTimeout(() => {
          setShowStreakAnimation(false);
          streakAnimationTimerRef.current = null;
        }, 1500);
        
        // More confetti for higher streaks
        if (newStreak >= 3) {
          setTimeout(() => {
            confetti({
              particleCount: newStreak * 20,
              spread: 80,
              origin: { y: 0.5 }
            });
          }, 300);
        }
      }

      // Set transitioning state for correct answers
      if (dailyStatus.remainingChallenges > 0 && dailyStatus.canChallenge && !showComplete) {
        transitionTimerRef.current = setTimeout(() => {
          setIsTransitioning(true);
          playTransition(); // Play transition sound
          transitionTimerRef.current = null;
        }, 1000);
      }
    } else {
      playWrong();
      // Reset streak on wrong answer
      setCurrentStreak(0);
    }
    
    // After delay, reset for next challenge
    resultTimerRef.current = setTimeout(() => {
      setShowResult(false);
      setSelectedWordId(null);
      
      // Only start a new challenge if not completed
      if (dailyStatus.remainingChallenges > 0 && dailyStatus.canChallenge && !showComplete) {
        dispatch(resetChallengeState());
        dispatch(startNewChallenge());
        
        // Reset transition state after a short delay
        resetTransitionTimerRef.current = setTimeout(() => {
          setIsTransitioning(false);
          resetTransitionTimerRef.current = null;
        }, 300);
      }
      
      resultTimerRef.current = null;
    }, isCorrect ? 1500 : 2000); // Shorter delay for correct answers to keep the pace engaging
  }, [showResult, currentChallenge.targetWord, dispatch, dailyStatus.remainingChallenges, 
      dailyStatus.canChallenge, showComplete, playCorrect, playWrong, playTransition, currentStreak]);
  
  const handleReplayAudio = useCallback(() => {
    if (!audioIsPlaying) {
      playTargetWordAudio();
    }
  }, [audioIsPlaying, playTargetWordAudio]);
  
  const triggerConfetti = useCallback((streak = 0) => {
    // Clear any existing timer
    if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    
    // Optimize confetti for better performance
    confetti({
      particleCount: 50, // Reduced particle count
      spread: 60,
      origin: { y: 0.6 }
    });
    
    // Optimize emoji confetti - reduce number of elements
    const emojis = ['🎉', '⭐', '🌟', '✨', '🎊'];
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    // Create fewer emoji elements for better performance
    for (let i = 0; i < 10; i++) {
      const emoji = document.createElement('div');
      emoji.className = 'confetti';
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.left = Math.random() * 100 + 'vw';
      emoji.style.fontSize = (Math.random() * 20 + 10) + 'px';
      emoji.style.opacity = Math.random() * 0.5 + 0.5;
      
      const animationClass = i % 2 === 0 
        ? 'confetti--animation-medium' 
        : 'confetti--animation-fast';
      emoji.classList.add(animationClass);
      
      container.appendChild(emoji);
    }
    
    // Remove confetti container after animation completes to free up resources
    confettiTimerRef.current = setTimeout(() => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      confettiTimerRef.current = null;
    }, 3000);
  }, []);
  
  // Memoize the image URL function
  const getImageUrl = useCallback((word) => {
    if (!word) return null;
    
    if (word.imageUrl) {
      if (word.imageUrl.startsWith('/')) {
        const apiUrl = (window._env_ && window._env_.REACT_APP_API_URL) || 'http://localhost:5001';
        return `${apiUrl}${word.imageUrl}`;
      }
      return word.imageUrl;
    }
    
    return `https://via.placeholder.com/300x300?text=${encodeURIComponent(word.word)}`;
  }, []);
  
  // Animation variants
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
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12 } }
  }), []);
  
  // Use useMemo for complex data processing
  const wordChoiceClasses = useMemo(() => {
    // Return an object with classes for each word choice state
    return {
      container: `word-choices-container ${isTransitioning ? 'transitioning' : ''}`,
      wordChoice: (wordId) => `word-choice ${selectedWordId === wordId ? 'selected' : ''} ${
        showResult && selectedWordId === wordId ? (result ? 'correct' : 'incorrect') : ''
      }`,
      // Add any other computed class strings here
    };
  }, [isTransitioning, selectedWordId, showResult, result]);
  
  // Add useMemo for additional derived data
  const challengeStatus = useMemo(() => {
    return {
      isCompleted: currentChallenge.completed,
      hasWords: currentChallenge.displayedWords.length > 0,
      correctWordId: currentChallenge.targetWord?._id,
      correctWordText: currentChallenge.targetWord?.word,
      correctWordImageUrl: getImageUrl(currentChallenge.targetWord),
      remainingChallenges: dailyStatus.remainingChallenges,
      completedChallenges: dailyStatus.completedToday
    };
  }, [currentChallenge, dailyStatus, getImageUrl]);
  
  // Memoize the challenge word cards to prevent unnecessary re-renders
  const WordChoiceCards = useMemo(() => {
    if (!currentChallenge.displayedWords.length) return null;
    
    return currentChallenge.displayedWords.map(word => (
      <motion.div
        key={word._id}
        variants={itemVariants}
        whileHover={{ 
          scale: 1.05, 
          y: -5,
          transition: { type: "spring", stiffness: 300 }
        }}
        whileTap={{ scale: 0.95 }}
        className={wordChoiceClasses.wordChoice(word._id)}
        onClick={() => handleWordSelect(word._id)}
      >
        <div className="card-content p-5 md:p-6 relative overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-50 to-purple-100 border-4 border-indigo-200 shadow-lg">
          {/* Fun decorative elements on the card */}
          <div className="absolute -top-3 -right-3 text-3xl transform rotate-12 z-10">✨</div>
          <div className="absolute -bottom-3 -left-3 text-3xl transform -rotate-12 z-10">✨</div>
          
          {/* Image container with larger size and better styling */}
          <div className="img-container mb-4 rounded-xl border-4 border-indigo-200 p-3 bg-white shadow-inner">
            <div className="relative w-full h-40 sm:h-48 md:h-56 flex items-center justify-center">
              <img
                src={getImageUrl(word)}
                alt={word.word}
                className="w-full h-full object-contain sm:object-cover md:object-contain"
                style={{ objectPosition: 'center' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/word-placeholder.png';
                }}
              />
              
              {/* Decorative character pointing at the image */}
              <div className="absolute bottom-2 right-2 text-3xl transform rotate-6 animate-bounce-light">
                {['🦊', '🐻', '🐸', '🐯', '🦁'][Math.floor(Math.random() * 5)]}
              </div>
            </div>
          </div>
          
          {/* Word text with playful style */}
          <div className="word-text-container relative">
            <h3 className="text-2xl font-bold text-center py-3 px-4 rounded-full bg-white shadow-sm border-2 border-indigo-200 font-baloo text-indigo-700">
              {word.word}
            </h3>
          </div>
        </div>
      </motion.div>
    ));
  }, [currentChallenge.displayedWords, itemVariants, wordChoiceClasses, handleWordSelect, getImageUrl]);
  
  // Add proper cleanup for timers and resources
  useEffect(() => {
    // Cleanup function for component unmount
    return () => {
      // Cancel any ongoing speech synthesis
      window.speechSynthesis.cancel();
      
      // Clear all timers
      if (streakAnimationTimerRef.current) clearTimeout(streakAnimationTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
      if (resetTransitionTimerRef.current) clearTimeout(resetTransitionTimerRef.current);
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
      
      // Release audio resources
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current.load();
          audioRef.current = null;
        } catch (error) {
          console.error('Error cleaning up audio resources:', error);
        }
      }
      
      // Release sound effect resources
      [correctSoundRef, wrongSoundRef, completeSoundRef, transitionSoundRef].forEach(ref => {
        if (ref.current) {
          try {
            ref.current.pause();
            ref.current.src = '';
          } catch (error) {
            console.error('Error cleaning up sound effect resources:', error);
          }
        }
      });
      
      // Clean up confetti elements
      const confettiContainer = document.querySelector('.confetti-container');
      if (confettiContainer && confettiContainer.parentNode) {
        confettiContainer.parentNode.removeChild(confettiContainer);
      }
    };
  }, []);
  
  if (isLoading && !currentChallenge.displayedWords.length) {
    return (
      <div className="min-h-screen bg-kid-gradient p-4 sm:p-6 flex justify-center items-center">
        <div className="text-center bg-white p-8 rounded-3xl shadow-lg border-4 border-indigo-200 w-64">
          <div className="animate-bounce text-6xl mb-4">🔄</div>
          <p className="text-xl font-bold text-indigo-600 font-baloo">Loading...</p>
          <div className="mt-4 w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse-width"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (learnedWords.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-kid-gradient p-4 sm:p-6">
        <div className="max-w-4xl mx-auto text-center p-8 bg-gradient-to-b from-indigo-50 to-blue-100 rounded-3xl shadow-xl border-4 border-indigo-200">
          <div className="text-5xl mb-6 animate-bounce">📚</div>
          <h2 className="text-3xl font-bold text-indigo-600 mb-4 font-baloo">No Words to Challenge!</h2>
          <p className="text-xl text-gray-700 mb-6 font-comic">
            You need to learn some words first before taking challenges.
          </p>
          <a 
            href="/study" 
            className="inline-block mt-4 py-3 px-6 font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <span className="mr-2">📝</span> Go Study Words
          </a>
        </div>
      </div>
    );
  }
  
  if (!dailyStatus.canChallenge || dailyStatus.remainingChallenges <= 0) {
    return (
      <div className="min-h-screen bg-kid-gradient p-4 sm:p-6">
        <div className="max-w-4xl mx-auto text-center p-8 bg-gradient-to-b from-green-50 to-green-100 rounded-3xl shadow-xl border-4 border-green-200">
          <div className="text-5xl mb-6">
            <span className="inline-block animate-bounce mx-2">🎉</span>
            <span className="inline-block animate-float mx-2">🏆</span>
            <span className="inline-block animate-bounce-light mx-2">🌟</span>
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4 font-baloo">Challenge Completed!</h2>
          <p className="text-xl text-gray-700 mb-6 font-comic">
            You've completed your daily challenges. Come back tomorrow for more!
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <a 
              href="/progress" 
              className="inline-block py-3 px-6 font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <span className="mr-2">📊</span> View Your Progress
            </a>
            <a 
              href="/study" 
              className="inline-block py-3 px-6 font-bold bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <span className="mr-2">📚</span> Go Study More
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-kid-gradient p-4 sm:p-6 relative">
      {/* Enhanced background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Clouds */}
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
        
        {/* Add rainbow */}
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
        
        {/* Add butterfly */}
        <div 
          className="absolute text-3xl"
          style={{
            right: '15%',
            bottom: '25%',
            animation: 'float-butterfly 15s linear infinite',
          }}
        >
          🦋
        </div>
        
        {/* Add some stars */}
        {[...Array(5)].map((_, i) => (
          <div 
            key={`star-${i}`}
            className="absolute text-3xl"
            style={{
              right: `${Math.random() * 30 + 30}%`,
              top: `${Math.random() * 30 + 5}%`,
              animation: `pulse-gentle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * -3}s`,
              fontSize: `${Math.random() * 15 + 20}px`,
            }}
          >
            ✨
          </div>
        ))}
      </div>
      
      {/* Streak counter animation */}
      {showStreakAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1.2, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white py-4 px-8 rounded-full font-baloo text-3xl shadow-lg border-4 border-white"
          >
            <span className="mr-2">🔥</span>{currentStreak} Word Streak!<span className="ml-2">🔥</span>
          </motion.div>
        </div>
      )}
      
      {/* Transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-indigo-600 bg-opacity-80 text-white py-5 px-10 rounded-2xl font-baloo text-2xl shadow-lg border-4 border-indigo-300"
          >
            <span className="inline-block animate-spin mr-3 text-3xl">🚀</span>
            Getting Next Challenge...
          </motion.div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="relative mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 font-baloo tracking-wide">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 drop-shadow-sm">
              Word Challenge!
            </span>
            <span className="ml-4 inline-block animate-bounce">🎯</span>
          </h1>
          
          {/* Add decorative elements around the title */}
          <div className="absolute -top-6 -left-6 text-4xl animate-float" style={{ animationDelay: '-2s' }}>✨</div>
          <div className="absolute -bottom-6 -right-6 text-4xl animate-float" style={{ animationDelay: '-1s' }}>✨</div>
          <div className="absolute top-1/2 -translate-y-1/2 -left-12 text-5xl hidden lg:block animate-float" style={{ animationDelay: '-3s' }}>🎈</div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-12 text-5xl hidden lg:block animate-float" style={{ animationDelay: '-4s' }}>🎈</div>
          
          {/* Challenge progress indicator with more visual appeal */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="font-baloo text-lg text-indigo-700 flex items-center">
                <span className="mr-2 text-2xl">🏆</span>Daily Challenges:
              </span>
              <span className="font-baloo text-lg text-indigo-700">
                {dailyStatus.challengesCompleted} of 3 completed
                <span className="ml-2 text-2xl">🎮</span>
              </span>
            </div>
            <div className="progress-bar h-5 bg-indigo-100 rounded-full overflow-hidden border-2 border-indigo-200 shadow-inner">
              <div 
                className="progress-fill h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out"
                style={{ width: `${Math.max(5, (dailyStatus.challengesCompleted / 3) * 100)}%` }}
              >
                {dailyStatus.challengesCompleted > 0 && (
                  <span className="text-white text-xs font-bold">
                    {Math.round((dailyStatus.challengesCompleted / 3) * 100)}%
                  </span>
                )}
              </div>
            </div>
            
            {/* Add session stats display */}
            <div className="mt-3 flex flex-wrap justify-between text-sm">
              <div className="bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 border border-indigo-100 mb-2">
                <span className="font-semibold">Challenges:</span> {dailyStatus.challengesCompleted} of 3
              </div>
              {wordsForReview.length > 0 && (
                <div className="bg-amber-50 px-3 py-1 rounded-full text-amber-700 border border-amber-100 mb-2">
                  <span className="font-semibold">Words for Review:</span> {wordsForReview.length}
                </div>
              )}
              {currentStreak > 0 && (
                <div className="bg-pink-50 px-3 py-1 rounded-full text-pink-700 border border-pink-100 mb-2">
                  <span className="font-semibold">Streak:</span> {currentStreak}
                </div>
              )}
            </div>
            
            {/* Current streak display with enhanced visual */}
            {currentStreak > 0 && (
              <div className="mt-4 text-center">
                <div className={`inline-block bg-gradient-to-r from-yellow-400 to-amber-500 text-white py-3 px-6 rounded-full font-baloo text-xl font-bold shadow-md border-2 border-yellow-300 ${currentStreak >= 3 ? 'animate-pulse' : ''}`}>
                  <span className="mr-2">🔥</span> Word Streak: {currentStreak} <span className="ml-2">🔥</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {showComplete ? (
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
                Challenges Complete! 🎉
              </motion.h2>
              
              <motion.p 
                className="text-2xl text-white font-comic relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                You've completed all your daily challenges!
              </motion.p>
              
              {/* Add a trophy or reward image */}
              <motion.div 
                className="my-6 text-8xl"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: 1, 
                  rotate: [0, 10, -10, 10, 0],
                  y: [0, -10, 0, -10, 0] 
                }}
                transition={{ 
                  type: "spring", 
                  duration: 1.5, 
                  delay: 0.4 
                }}
              >
                🏆
              </motion.div>
              
              <motion.div
                className="mt-6 relative z-10 flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <a 
                  href="/progress" 
                  className="btn-secondary inline-block py-4 px-8 rounded-full font-bold text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all bg-gradient-to-r from-indigo-400 to-indigo-500 text-white"
                >
                  <span className="text-2xl mr-2">📊</span> See Your Progress
                </a>
                
                {/* New button to go to the next challenge set */}
                <a 
                  href="/challenge" 
                  className="btn-primary inline-block py-4 px-8 rounded-full font-bold text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all bg-gradient-to-r from-green-400 to-emerald-500 text-white border-2 border-green-300"
                  onClick={() => {
                    toast.success("Get ready for new challenges tomorrow!");
                    playTransition();
                  }}
                >
                  <span className="text-2xl mr-2">🚀</span> Next Challenge Set
                </a>
              </motion.div>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <div className="bg-gradient-to-b from-indigo-50 to-blue-100 p-8 rounded-3xl shadow-lg inline-block border-4 border-indigo-200 relative">
                  {/* Decorative elements */}
                  <div className="absolute -top-3 -left-3 text-3xl transform rotate-12">🔍</div>
                  <div className="absolute -bottom-3 -right-3 text-3xl transform -rotate-12">🎧</div>
                  
                  <h2 className="text-3xl mb-4 font-bold text-indigo-700 font-baloo">
                    Listen and Find the Word:
                  </h2>
                  <button 
                    onClick={handleReplayAudio}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-5xl p-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 touch-target border-4 border-indigo-300 transform hover:scale-105 relative group"
                    disabled={audioIsPlaying}
                  >
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-yellow-100 px-4 py-2 rounded-lg shadow-md text-amber-800 font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Click to hear the word
                    </div>
                    🔊
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full text-xs font-bold text-indigo-700 mt-2 whitespace-nowrap">
                      Click to hear
                    </span>
                  </button>
                  
                  {currentChallenge.currentAttempt > 0 && (
                    <motion.div 
                      className="mt-5 font-baloo"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {currentChallenge.currentAttempt === 1 ? (
                        <div className="bg-amber-100 text-amber-700 p-3 rounded-xl border-2 border-amber-200">
                          <span className="text-xl mr-2">🤔</span>
                          Try again! Listen carefully!
                        </div>
                      ) : currentChallenge.currentAttempt === 2 ? (
                        <div className="bg-orange-100 text-orange-700 p-3 rounded-xl border-2 border-orange-200">
                          <span className="text-xl mr-2">💪</span>
                          One more try! You can do it!
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Word choices with enhanced styling */}
              <motion.div 
                className={`${wordChoiceClasses.container} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {WordChoiceCards}
              </motion.div>
              
              {/* Add helper buttons if available */}
              {currentChallenge.currentAttempt > 1 && (
                <div className="mt-8 text-center">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white py-3 px-6 rounded-full shadow-md flex items-center mx-auto transform hover:scale-105 transition-all"
                    onClick={() => {
                      // If this is the third attempt, reveal the answer
                      if (currentChallenge.currentAttempt >= 2) {
                        toast.info(`The word is "${currentChallenge.targetWord.word}"`, {
                          icon: '💡',
                          duration: 5000
                        });
                      }
                    }}
                  >
                    <span className="text-xl mr-2">💡</span> 
                    <span className="font-baloo">Need a Hint?</span>
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Challenge; 