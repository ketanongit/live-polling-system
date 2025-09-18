import { createSlice } from '@reduxjs/toolkit'
import { POLL_STATUS } from '../../utils/constants'

const initialState = {
  // Current poll state
  currentPoll: null,
  status: POLL_STATUS.WAITING, // 'waiting', 'active', 'ended'
  timeLeft: 60,
  results: [],
  hasAnswered: false,
  selectedOption: null,
  
  // Students (for teacher)
  students: [],
  totalParticipants: 0,
  answeredCount: 0,
  
  // Poll history
  pollHistory: [],
  
  // UI state
  loading: false,
  error: null,
  
  // Socket connection
  socket: null
}

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    // Socket management
    setSocket: (state, action) => {
      state.socket = action.payload
    },
    
    // Poll management
    setPoll: (state, action) => {
      state.currentPoll = action.payload
      state.status = action.payload ? POLL_STATUS.ACTIVE : POLL_STATUS.WAITING
      state.hasAnswered = false
      state.selectedOption = null
    },
    
    clearPoll: (state) => {
      state.currentPoll = null
      state.status = POLL_STATUS.WAITING
      state.hasAnswered = false
      state.selectedOption = null
      state.results = []
    },
    
    // Timer
    setTimeLeft: (state, action) => {
      state.timeLeft = action.payload
    },
    
    // Answers and results
    setResults: (state, action) => {
      state.results = action.payload
    },
    
    setAnswered: (state, action) => {
      state.hasAnswered = true
      state.selectedOption = action.payload
    },
    
    // Students management
    setStudents: (state, action) => {
      state.students = action.payload
    },
    
    addStudent: (state, action) => {
      const exists = state.students.find(s => s.id === action.payload.id)
      if (!exists) {
        state.students.push(action.payload)
      }
    },
    
    removeStudent: (state, action) => {
      state.students = state.students.filter(s => s.id !== action.payload)
    },
    
    updateAnsweredCount: (state, action) => {
      state.answeredCount = action.payload.answered || 0
      state.totalParticipants = action.payload.totalParticipants || 0
    },
    
    // Poll history
    setPollHistory: (state, action) => {
      state.pollHistory = action.payload
    },
    
    addToPollHistory: (state, action) => {
      state.pollHistory.unshift(action.payload)
    },
    
    // Status management
    setStatus: (state, action) => {
      state.status = action.payload
    },
    
    endPoll: (state, action) => {
      state.status = POLL_STATUS.ENDED
      if (action.payload) {
        state.results = action.payload.results
        state.totalParticipants = action.payload.totalParticipants
      }
      // Add to history if we have complete poll data
      if (state.currentPoll && action.payload) {
        const historyEntry = {
          id: Date.now(),
          question: state.currentPoll.question,
          options: state.currentPoll.options,
          results: action.payload.results,
          timestamp: new Date(),
          totalParticipants: action.payload.totalParticipants
        }
        state.pollHistory.unshift(historyEntry)
      }
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    
    // Reset
    reset: (state) => {
      return {
        ...initialState,
        socket: state.socket // Keep socket connection
      }
    }
  }
})

export const {
  setSocket,
  setPoll,
  clearPoll,
  setTimeLeft,
  setResults,
  setAnswered,
  setStudents,
  addStudent,
  removeStudent,
  updateAnsweredCount,
  setPollHistory,
  addToPollHistory,
  setStatus,
  endPoll,
  setError,
  clearError,
  setLoading,
  reset
} = pollSlice.actions

export default pollSlice.reducer
