import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { socketManager } from '../utils/socket'
import { SOCKET_EVENTS } from '../utils/constants'
import { setConnected, setError } from '../store/slices/authSlice'
import {
  setSocket,
  setPoll,
  setResults,
  setStudents,
  updateAnsweredCount,
  setTimeLeft,
  endPoll,
  setPollHistory,
  setError as setPollError,
  setStatus,
  resetAnsweredState,
  setAnswered
} from '../store/slices/pollSlice'
import { addMessage } from '../store/slices/chatSlice'
import { POLL_STATUS } from '../utils/constants'

// Global flag to prevent multiple listener setups
let listenersSetup = false

export const useSocket = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const socket = socketManager.connect()
    dispatch(setSocket(socket))
    
    // Add a flag to prevent duplicate listeners
    if (listenersSetup) {
      console.log('🔄 Socket listeners already added globally, skipping setup')
      return
    }
    
    console.log('🎯 Setting up socket event listeners for the first time')
    listenersSetup = true

    // Test that event listeners are working
    socket.on('test_event', (data) => {
      console.log('🧪 TEST EVENT RECEIVED:', data)
    })

    // Connection events
    socket.on('connect', () => {
      dispatch(setConnected(true))
      dispatch(setError(null)) // Clear any connection errors
      console.log('✅ Connected to server successfully')
    })

    socket.on('disconnect', () => {
      dispatch(setConnected(false))
      console.log('❌ Disconnected from server')
    })

    socket.on('connect_error', (error) => {
      dispatch(setConnected(false))
      dispatch(setError('Unable to connect to server. Please check if the server is running.'))
      console.error('❌ Connection error:', error)
    })

    // Error handling
    socket.on(SOCKET_EVENTS.ERROR, (data) => {
      dispatch(setError(data.message))
      dispatch(setPollError(data.message))
      console.error('Server error:', data.message)
    })

    // Teacher events
    socket.on(SOCKET_EVENTS.TEACHER_JOINED, (data) => {
      console.log('🎓 Teacher joined event received:', {
        hasPoll: !!data.currentPoll,
        studentsCount: data.students?.length || 0,
        isActive: data.isActive,
        timeLeft: data.timeLeft
      })
      
      dispatch(setPoll(data.currentPoll))
      dispatch(setStudents(data.students || []))
      dispatch(setResults(data.results || []))
      dispatch(setTimeLeft(data.timeLeft || 60))
      dispatch(setPollHistory(data.pollHistory || []))
      
      if (data.currentPoll && data.isActive) {
        dispatch(setStatus(POLL_STATUS.ACTIVE))
      } else if (data.currentPoll) {
        dispatch(setStatus(POLL_STATUS.ENDED))
      } else {
        dispatch(setStatus(POLL_STATUS.WAITING))
      }
    })

    // Student events
    socket.on(SOCKET_EVENTS.STUDENT_JOINED, (data) => {
      console.log('🎒 Student joined event received:', {
        hasPoll: !!data.currentPoll,
        isActive: data.isActive,
        timeLeft: data.timeLeft,
        pollQuestion: data.currentPoll?.question,
        resultsCount: data.results?.length || 0,
        totalParticipants: data.totalParticipants
      })
      
      dispatch(setPoll(data.currentPoll))
      dispatch(setTimeLeft(data.timeLeft || 60))
      
      // Always set results and total participants if available
      if (data.results) {
        dispatch(setResults(data.results))
      }
      
      if (data.totalParticipants !== undefined) {
        dispatch(updateAnsweredCount({
          answered: 0, // Will be updated by next results update
          totalParticipants: data.totalParticipants
        }))
      }
      
      if (data.currentPoll && data.isActive) {
        console.log('📚 Setting student status to ACTIVE with timeLeft:', data.timeLeft)
        dispatch(setStatus(POLL_STATUS.ACTIVE))
      } else if (data.currentPoll) {
        console.log('📊 Setting student status to ENDED')
        dispatch(setStatus(POLL_STATUS.ENDED))
      } else {
        console.log('⏳ Setting student status to WAITING')
        dispatch(setStatus(POLL_STATUS.WAITING))
      }
    })

    // Poll events
    socket.on(SOCKET_EVENTS.POLL_CREATED, (data) => {
      console.log('🆕🆕🆕 POLL CREATED EVENT RECEIVED 🆕🆕🆕:', {
        question: data.poll?.question,
        timeLeft: data.timeLeft,
        optionsCount: data.poll?.options?.length,
        socketId: socket.id
      })
      
      // Reset all state for new poll
      dispatch(resetAnsweredState()) // Reset first
      dispatch(setPoll(data.poll))
      dispatch(setTimeLeft(data.timeLeft))
      dispatch(setStatus(POLL_STATUS.ACTIVE))
      dispatch(setResults([])) // Clear previous results
      
      console.log('✅ Poll state updated after poll_created event')
    })

    socket.on(SOCKET_EVENTS.POLL_ENDED, (data) => {
      console.log('🏁 Poll ended event received:', {
        resultsCount: data.results?.length || 0,
        totalParticipants: data.totalParticipants
      })
      
      dispatch(endPoll(data))
      dispatch(setStatus(POLL_STATUS.ENDED))
    })

    socket.on(SOCKET_EVENTS.RESULTS_UPDATED, (data) => {
      console.log('📊 Results updated event received:', {
        resultsCount: data.results?.length || 0,
        answered: data.answered,
        totalParticipants: data.totalParticipants
      })
      
      dispatch(setResults(data.results || []))
      dispatch(updateAnsweredCount({
        answered: data.answered || 0,
        totalParticipants: data.totalParticipants || 0
      }))
    })

    socket.on(SOCKET_EVENTS.TIMER_UPDATE, (data) => {
      console.log('⏰⏰⏰ TIMER UPDATE RECEIVED:', data.timeLeft, 'socketId:', socket.id)
      dispatch(setTimeLeft(data.timeLeft))
      
      // Update status based on timer
      if (data.timeLeft <= 0) {
        console.log('⏰ Timer expired, setting status to ENDED')
        dispatch(setStatus(POLL_STATUS.ENDED))
      }
    })

    socket.on(SOCKET_EVENTS.STUDENT_LIST_UPDATED, (data) => {
      console.log('👥 Student list updated:', data.students?.length || 0, 'students')
      dispatch(setStudents(data.students || []))
    })

    socket.on(SOCKET_EVENTS.POLL_HISTORY, (data) => {
      console.log('📚 Poll history received:', data.history?.length || 0, 'polls')
      dispatch(setPollHistory(data.history || []))
    })

    socket.on(SOCKET_EVENTS.ANSWER_SUBMITTED, (data) => {
      console.log('✅ Answer submitted event received:', {
        optionIndex: data.optionIndex,
        isCorrect: data.isCorrect,
        resultsCount: data.results?.length || 0
      })
      
      dispatch(setAnswered({
        optionIndex: data.optionIndex,
        isCorrect: data.isCorrect
      }))
      dispatch(setResults(data.results || []))
    })

    socket.on(SOCKET_EVENTS.KICKED_OUT, () => {
      console.log('🚪 Student kicked out')
      window.location.href = '/kicked-out'
    })

    // Chat events
    socket.on('message_received', (data) => {
      dispatch(addMessage(data))
    })

    // Cleanup function - only clean up on unmount, not on re-renders
    return () => {
      console.log('🧹 Component unmounting - preserving socket listeners')
      // Don't clean up listeners to preserve socket connection across re-renders
    }
  }, [dispatch])  // Include dispatch but prevent re-setup with global flag

  return socketManager.getSocket()
}