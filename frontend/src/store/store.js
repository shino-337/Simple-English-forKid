import userReducer from './slices/userSlice';
import categoryReducer from './slices/categorySlice';
import wordReducer from './slices/wordSlice';
import progressReducer from './slices/progressSlice';
import challengeReducer from './slices/challengeSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    categories: categoryReducer,
    words: wordReducer,
    progress: progressReducer,
    challenge: challengeReducer,
  },
  // ... existing code ...
}); 