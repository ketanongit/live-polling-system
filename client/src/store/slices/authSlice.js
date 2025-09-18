import { createSlice } from '@reduxjs/toolkit'
import { USER_ROLES } from '../../utils/constants'

const initialState = {
  role: null, // 'teacher' or 'student'
  name: '',
  isConnected: false,
  error: null,
  loading: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRole: (state, action) => {
      state.role = action.payload
      state.error = null
    },
    setName: (state, action) => {
      state.name = action.payload
      state.error = null
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    reset: (state) => {
      return initialState
    }
  }
})

export const {
  setRole,
  setName,
  setConnected,
  setError,
  setLoading,
  clearError,
  reset
} = authSlice.actions

export default authSlice.reducer
