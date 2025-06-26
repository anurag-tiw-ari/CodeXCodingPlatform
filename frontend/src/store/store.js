import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../authSlice.js';
import socketReducer from '../socketSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    socket: socketReducer
  }
});