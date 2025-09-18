import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import pollSlice from './slices/pollSlice'
import chatSlice from './slices/chatSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    poll: pollSlice,
    chat: chatSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['poll/setSocket'],
        ignoredPaths: ['poll.socket'],
      },
    }),
})
