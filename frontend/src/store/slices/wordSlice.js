import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { fetchProgressStats, refreshProgressStatsQuiet } from './progressSlice';

// Async thunks
export const fetchAllWords = createAsyncThunk(
  'words/fetchAllWords',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/words');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const fetchWordsByCategory = createAsyncThunk(
  'words/fetchWordsByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/words/category/${categoryId}`);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const markWordAsLearned = createAsyncThunk(
  'words/markAsLearned',
  async (wordId, { rejectWithValue, getState, dispatch }) => {
    try {
      const { selectedCategory } = getState().categories;
      
      // First, mark the word as learned in the Word model
      await api.put(`/words/${wordId}/learn`);
      
      // Then update the user's progress
      const response = await api.put(
        `/users/progress`,
        {
          categoryId: selectedCategory._id,
          wordId: wordId
        }
      );
      
      // Refresh progress stats without showing loading state
      dispatch(refreshProgressStatsQuiet());
      
      return { wordId, userData: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const updateWord = createAsyncThunk(
  'words/updateWord',
  async ({ id, wordData }, { rejectWithValue }) => {
    try {
      // If wordData is already FormData, use it directly
      const formData = wordData instanceof FormData ? wordData : new FormData();
      
      // If it's not FormData, add the fields (this is a fallback)
      if (!(wordData instanceof FormData)) {
        // Add text fields
        formData.append('word', wordData.word);
        formData.append('meaning', wordData.meaning);
        formData.append('category', wordData.category);
        formData.append('difficulty', wordData.difficulty || 'beginner');
        
        // Add examples as JSON string
        formData.append('examples', JSON.stringify(wordData.examples || []));
        
        // Add files if they exist
        if (wordData.image) {
          formData.append('image', wordData.image);
        }
        
        if (wordData.audio) {
          formData.append('audio', wordData.audio);
        }
      }
      
      const response = await api.put(`/words/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error in updateWord:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || error.message || "An error occurred");
    }
  }
);

export const createWord = createAsyncThunk(
  'words/createWord',
  async (wordData, { rejectWithValue }) => {
    try {
      // If wordData is already FormData, use it directly
      const formData = wordData instanceof FormData ? wordData : new FormData();
      
      // If it's not FormData, add the fields (this is a fallback)
      if (!(wordData instanceof FormData)) {
        // Add text fields
        formData.append('word', wordData.word);
        formData.append('meaning', wordData.meaning);
        formData.append('category', wordData.category);
        formData.append('difficulty', wordData.difficulty || 'beginner');
        
        // Add examples as JSON string
        formData.append('examples', JSON.stringify(wordData.examples || []));
        
        // Add files if they exist
        if (wordData.image) {
          formData.append('image', wordData.image);
        }
        
        if (wordData.audio) {
          formData.append('audio', wordData.audio);
        }
      }
      
      // Log the FormData entries for debugging
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      const response = await api.post('/words', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error in createWord:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || error.message || "An error occurred");
    }
  }
);

export const deleteWord = createAsyncThunk(
  'words/deleteWord',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/words/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

const initialState = {
  words: [],
  learnedWords: [],
  isLoading: false,
  error: null
};

const wordSlice = createSlice({
  name: 'words',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Words
      .addCase(fetchAllWords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllWords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.words = action.payload;
      })
      .addCase(fetchAllWords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Words by Category
      .addCase(fetchWordsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWordsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.words = action.payload;
      })
      .addCase(fetchWordsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark Word as Learned
      .addCase(markWordAsLearned.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markWordAsLearned.fulfilled, (state, action) => {
        state.isLoading = false;
        state.learnedWords.push(action.payload.wordId);
      })
      .addCase(markWordAsLearned.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Word
      .addCase(createWord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.words.push(action.payload);
      })
      .addCase(createWord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Word
      .addCase(updateWord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWord.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.words.findIndex(word => word._id === action.payload._id);
        if (index !== -1) {
          state.words[index] = action.payload;
        }
      })
      .addCase(updateWord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Word
      .addCase(deleteWord.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWord.fulfilled, (state, action) => {
        state.isLoading = false;
        state.words = state.words.filter(word => word._id !== action.payload);
      })
      .addCase(deleteWord.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = wordSlice.actions;
export default wordSlice.reducer; 