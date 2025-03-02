import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

// Get the API URL from environment variables
const apiUrl = (window._env_ && window._env_.REACT_APP_API_URL) || 'http://localhost:5001';

// Define initial state outside to reference it in reducers
const initialState = {
  learnedWords: [],
  currentChallenge: {
    displayedWords: [],
    targetWord: null,
    currentAttempt: 0,
    totalMistakes: 0,
    completed: false
  },
  dailyStatus: {
    challengesCompleted: 0,
    remainingChallenges: 3,
    canChallenge: true,
    lastResetDate: null,
  },
  wordsForReview: [],
  challengeStats: {
    totalChallenges: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    wordsForReview: [],
    streak: 0,
    lastCompletedDate: null
  },
  isLoading: false,
  error: null
};

// Get learned words for challenges
export const fetchLearnedWords = createAsyncThunk(
  'challenge/fetchLearnedWords',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/words/learned');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch learned words');
    }
  }
);

// Record challenge progress
export const recordChallengeProgress = createAsyncThunk(
  'challenge/recordProgress',
  async (progressData, { rejectWithValue }) => {
    try {
      // Ensure we have the selectedWordId parameter that the API requires
      const dataToSubmit = {
        selectedWordId: progressData.wordId, // Include selectedWordId parameter
        wasCorrect: progressData.wasCorrect,
        attempts: progressData.attempts
      };
      
      const response = await api.post('/challenges/submit', dataToSubmit);
      return response.data;
    } catch (error) {
      toast.error('Failed to record progress: ' + (error.response?.data?.message || 'Unknown error'));
      return rejectWithValue(error.response?.data?.message || 'Failed to record challenge progress');
    }
  }
);

// Mark word for review
export const markWordForReview = createAsyncThunk(
  'challenge/markForReview',
  async (wordId, { rejectWithValue }) => {
    try {
      // Add debugging to trace the API call
      console.log('Marking word for review:', wordId);
      
      // Fix the request body - include the proper data structure
      const response = await api.put(`/words/${wordId}/review`, { 
        wordId: wordId,
        needsReview: true 
      });
      
      // Show success toast
      toast.success('Word marked for review');
      return response.data;
    } catch (error) {
      console.error('Error marking word for review:', error.response || error);
      toast.error('Failed to mark word for review: ' + (error.response?.data?.message || 'Unknown error'));
      return rejectWithValue(error.response?.data?.message || 'Failed to mark word for review');
    }
  }
);

// Get daily challenge status
export const getDailyChallengeStatus = createAsyncThunk(
  'challenge/getDailyStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/challenges/daily');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get daily challenge status');
    }
  }
);

// Get challenge statistics for the Progress page
export const fetchChallengeStats = createAsyncThunk(
  'challenge/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/challenges/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch challenge statistics');
    }
  }
);

const challengeSlice = createSlice({
  name: 'challenge',
  initialState,
  reducers: {
    startNewChallenge: (state) => {
      // Make sure we have words to challenge
      if (state.learnedWords.length < 3) {
        return;
      }

      // Get random words for the challenge (2-3 words)
      const numWords = Math.min(3, state.learnedWords.length);
      const shuffledWords = [...state.learnedWords].sort(() => 0.5 - Math.random());
      const selectedWords = shuffledWords.slice(0, numWords);
      
      // Pick one random word as the target
      const targetIndex = Math.floor(Math.random() * selectedWords.length);
      
      state.currentChallenge = {
        displayedWords: selectedWords,
        targetWord: selectedWords[targetIndex],
        currentAttempt: 0,
        totalMistakes: state.currentChallenge.totalMistakes,
        completed: false,
      };
    },
    
    checkAnswer: (state, action) => {
      const { wordId } = action.payload;
      const isCorrect = wordId === state.currentChallenge.targetWord._id;
      
      if (!isCorrect) {
        // Increment attempt count and total mistakes
        state.currentChallenge.currentAttempt += 1;
        state.currentChallenge.totalMistakes += 1;
        
        // Check if reached max attempts for this word or total mistakes
        if (state.currentChallenge.currentAttempt >= 3 || state.currentChallenge.totalMistakes >= 5) {
          state.currentChallenge.completed = true;
          
          // If reached total mistake limit, mark that user can't challenge more today
          if (state.currentChallenge.totalMistakes >= 5) {
            state.dailyStatus.canChallenge = false;
          }
        }
      } else {
        // Correct answer
        state.currentChallenge.completed = true;
        state.dailyStatus.challengesCompleted += 1;
        state.dailyStatus.remainingChallenges -= 1;
        
        // If completed all 3 daily challenges, mark that user can't challenge more today
        if (state.dailyStatus.remainingChallenges <= 0) {
          state.dailyStatus.canChallenge = false;
        }
      }
    },
    
    resetChallengeState: (state) => {
      state.currentChallenge = {
        ...initialState.currentChallenge,
        totalMistakes: state.currentChallenge.totalMistakes,
      };
    },
    
    resetDailyChallenges: (state) => {
      state.dailyStatus = {
        ...initialState.dailyStatus,
        lastResetDate: new Date().toISOString(),
      };
      state.currentChallenge = initialState.currentChallenge;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLearnedWords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLearnedWords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.learnedWords = action.payload;
      })
      .addCase(fetchLearnedWords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getDailyChallengeStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDailyChallengeStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyStatus = {
          ...state.dailyStatus,
          ...action.payload,
        };
        
        // Reset challenge state if needed based on backend data
        if (action.payload.shouldReset) {
          state.currentChallenge = initialState.currentChallenge;
        }
      })
      .addCase(getDailyChallengeStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(recordChallengeProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(recordChallengeProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        // We don't need to update state here as we already updated it in the checkAnswer reducer
      })
      .addCase(recordChallengeProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(markWordForReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markWordForReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wordsForReview.push(action.payload.wordId);
      })
      .addCase(markWordForReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchChallengeStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChallengeStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.challengeStats = action.payload;
      })
      .addCase(fetchChallengeStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  startNewChallenge, 
  checkAnswer, 
  resetChallengeState,
  resetDailyChallenges
} = challengeSlice.actions;

export default challengeSlice.reducer; 