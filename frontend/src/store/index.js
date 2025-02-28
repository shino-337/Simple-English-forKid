import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import categoryReducer from './slices/categorySlice';
import wordReducer from './slices/wordSlice';
import challengeReducer from './slices/challengeSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    words: wordReducer,
    challenges: challengeReducer,
  },
});

export default store; 