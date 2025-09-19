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
      if (action.payload) {
        // New poll - reset all answer state
        state.status = POLL_STATUS.ACTIVE
        state.hasAnswered = false
        state.selectedOption = null
        state.results = [] // Clear previous results when new poll starts
        console.log('✅ Poll set - reset answer state for new poll')
      } else {
        state.status = POLL_STATUS.WAITING
        state.hasAnswered = false
        state.selectedOption = null
        state.results = []
      }
    },
    
    clearPoll: (state) => {
      state.currentPoll = null
      state.status = POLL_STATUS.WAITING
      state.hasAnswered = false
      state.selectedOption = null
      state.results = []
      state.timeLeft = 60
    },
    
    // Timer
    setTimeLeft: (state, action) => {
      state.timeLeft = action.payload
      // Update status based on time and poll state
      if (state.currentPoll) {
        if (action.payload > 0) {
          state.status = POLL_STATUS.ACTIVE
        } else {
          state.status = POLL_STATUS.ENDED
        }
      }
    },
    
    // Answers and results
    setResults: (state, action) => {
      state.results = action.payload || []
    },
    
    setAnswered: (state, action) => {
      state.hasAnswered = true
      state.selectedOption = action.payload
    },
    
    resetAnsweredState: (state) => {
      state.hasAnswered = false
      state.selectedOption = null
    },
    
    // Students management
    setStudents: (state, action) => {
      state.students = action.payload || []
      state.totalParticipants = (action.payload || []).length
    },
    
    addStudent: (state, action) => {
      const exists = state.students.find(s => s.id === action.payload.id)
      if (!exists) {
        state.students.push(action.payload)
        state.totalParticipants = state.students.length
      }
    },
    
    removeStudent: (state, action) => {
      state.students = state.students.filter(s => s.id !== action.payload)
      state.totalParticipants = state.students.length
    },
    
    updateAnsweredCount: (state, action) => {
      state.answeredCount = action.payload.answered || 0
      state.totalParticipants = action.payload.totalParticipants || state.students.length
    },
    
    // Poll history
    setPollHistory: (state, action) => {
      state.pollHistory = action.payload || []
    },
    
    addToPollHistory: (state, action) => {
      if (action.payload) {
        state.pollHistory.unshift(action.payload)
      }
    },
    
    // Status management
    setStatus: (state, action) => {
      state.status = action.payload
    },
    
    endPoll: (state, action) => {
      state.status = POLL_STATUS.ENDED
      state.timeLeft = 0
      
      if (action.payload) {
        state.results = action.payload.results || []
        state.totalParticipants = action.payload.totalParticipants || state.students.length
        
        // Add to history if we have complete poll data
        if (state.currentPoll) {
          const historyEntry = {
            id: Date.now(),
            question: state.currentPoll.question,
            options: state.currentPoll.options,
            results: action.payload.results || [],
            timestamp: new Date(),
            totalParticipants: action.payload.totalParticipants || state.students.length
          }
          state.pollHistory.unshift(historyEntry)
        }
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
  resetAnsweredState,
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