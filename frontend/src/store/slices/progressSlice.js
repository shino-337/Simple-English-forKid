import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchProgressStats = createAsyncThunk(
  'progress/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/progress/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const fetchCategoryProgress = createAsyncThunk(
  'progress/fetchCategoryProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/progress/categories');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const fetchStudyHistory = createAsyncThunk(
  'progress/fetchStudyHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/progress/history');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const recordStudySession = createAsyncThunk(
  'progress/recordSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/progress/record-session', sessionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'progress/updatePreferences',
  async (preferencesData, { rejectWithValue }) => {
    try {
      const response = await api.put('/progress/preferences', preferencesData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

// Additional action to silently refresh stats
export const refreshProgressStatsQuiet = createAsyncThunk(
  'progress/refreshStatsQuiet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/progress/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

const initialState = {
  stats: null,
  categoryProgress: [],
  studyHistory: [],
  preferences: {
    dailyWordGoal: 5,
    studyReminders: true,
    difficulty: 'beginner'
  },
  isLoading: false,
  error: null
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Progress Stats
      .addCase(fetchProgressStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProgressStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchProgressStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(`Error: ${action.payload}`);
      })
      
      // Fetch Category Progress
      .addCase(fetchCategoryProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryProgress = action.payload;
      })
      .addCase(fetchCategoryProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(`Error: ${action.payload}`);
      })
      
      // Fetch Study History
      .addCase(fetchStudyHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudyHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studyHistory = action.payload;
      })
      .addCase(fetchStudyHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(`Error: ${action.payload}`);
      })
      
      // Record Study Session
      .addCase(recordStudySession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(recordStudySession.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.session) {
          state.studyHistory = [action.payload.session, ...state.studyHistory];
        }
        if (action.payload.statistics) {
          if (state.stats) {
            state.stats.totalStudyTime = action.payload.statistics.totalTimeSpent;
            state.stats.streakDays = action.payload.statistics.streakDays;
          }
        }
        toast.success('Study session recorded!');
      })
      .addCase(recordStudySession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(`Error: ${action.payload}`);
      })
      
      // Update Preferences
      .addCase(updatePreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
        toast.success('Preferences updated!');
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(`Error: ${action.payload}`);
      })

      // Silent refresh of stats (doesn't change loading state)
      .addCase(refreshProgressStatsQuiet.fulfilled, (state, action) => {
        console.log('Progress stats silently refreshed:', action.payload);
        state.stats = action.payload;
      })
      .addCase(refreshProgressStatsQuiet.rejected, (state, action) => {
        // Just log the error but don't update state
        console.error('Failed to silently refresh stats:', action.payload);
      });
  }
});

export const { clearError } = progressSlice.actions;
export default progressSlice.reducer; 