import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
// Import mock data for development
import { words as mockWords } from '../../data/mockData';

// Helper function to generate unique IDs for mock data
const generateId = () => `word-${Math.floor(Math.random() * 10000)}`;

// Async thunks
export const fetchWordsByCategory = createAsyncThunk(
  'words/fetchWordsByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/words/category/${categoryId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const markWordAsLearned = createAsyncThunk(
  'words/markAsLearned',
  async (wordId, { rejectWithValue, getState }) => {
    try {
      const { selectedCategory } = getState().categories;
      
      const response = await api.put(
        `/users/progress`,
        {
          categoryId: selectedCategory._id,
          completedWords: [wordId]
        }
      );
      return { wordId, userData: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

export const createWord = createAsyncThunk(
  'words/createWord',
  async (wordData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('word', wordData.word);
      formData.append('translation', wordData.translation);
      formData.append('category', wordData.category);
      formData.append('difficulty', wordData.difficulty);
      
      // Append files if they exist
      if (wordData.image) {
        formData.append('image', wordData.image);
      }
      if (wordData.audio) {
        formData.append('audio', wordData.audio);
      }
      
      // Append examples as JSON string
      formData.append('examples', JSON.stringify(wordData.examples));

      const response = await api.post(
        `/words`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
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
      });
  }
});

export const { clearError } = wordSlice.actions;
export default wordSlice.reducer; 