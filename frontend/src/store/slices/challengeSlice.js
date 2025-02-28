import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Async thunks
export const fetchDailyChallenge = createAsyncThunk(
  'challenges/fetchDaily',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/challenges/daily');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch daily challenge'
      );
    }
  }
);

export const submitChallengeAnswer = createAsyncThunk(
  'challenges/submitAnswer',
  async ({ selectedWordId, isCorrect }, { rejectWithValue }) => {
    try {
      const response = await api.post('/challenges/submit', {
        selectedWordId,
        isCorrect
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit answer'
      );
    }
  }
);

export const fetchChallengeStats = createAsyncThunk(
  'challenges/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/challenges/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch challenge stats'
      );
    }
  }
);

const challengeSlice = createSlice({
  name: 'challenges',
  initialState: {
    currentChallenge: null,
    stats: null,
    dailyAttempts: 0,
    dailyMistakes: 0,
    isLoading: false,
    error: null
  },
  reducers: {
    incrementDailyAttempt: (state) => {
      state.dailyAttempts += 1;
    },
    incrementDailyMistake: (state) => {
      state.dailyMistakes += 1;
    },
    clearChallengeError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Daily
      .addCase(fetchDailyChallenge.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailyChallenge.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentChallenge = action.payload;
      })
      .addCase(fetchDailyChallenge.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Submit Answer
      .addCase(submitChallengeAnswer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitChallengeAnswer.fulfilled, (state, action) => {
        state.isLoading = false;
        // If we want to handle any response data here
      })
      .addCase(submitChallengeAnswer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchChallengeStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChallengeStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchChallengeStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  incrementDailyAttempt,
  incrementDailyMistake,
  clearChallengeError
} = challengeSlice.actions;

export default challengeSlice.reducer; 