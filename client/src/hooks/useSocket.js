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
  setStatus
} from '../store/slices/pollSlice'
import { addMessage } from '../store/slices/chatSlice'
import { POLL_STATUS } from '../utils/constants'

export const useSocket = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const socket = socketManager.connect()
    dispatch(setSocket(socket))

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
        pollQuestion: data.currentPoll?.question
      })
      
      dispatch(setPoll(data.currentPoll))
      dispatch(setTimeLeft(data.timeLeft || 60))
      
      if (data.currentPoll && data.isActive) {
        console.log('📚 Setting student status to ACTIVE with timeLeft:', data.timeLeft)
        dispatch(setStatus(POLL_STATUS.ACTIVE))
      } else if (data.currentPoll) {
        console.log('📊 Setting student status to ENDED')
        dispatch(setStatus(POLL_STATUS.ENDED))
        // If poll ended, show results
        if (data.results) {
          dispatch(setResults(data.results))
        }
      } else {
        console.log('⏳ Setting student status to WAITING')
        dispatch(setStatus(POLL_STATUS.WAITING))
      }
    })

    // Poll events
    socket.on(SOCKET_EVENTS.POLL_CREATED, (data) => {
      console.log('🆕 Poll created event received:', {
        question: data.poll?.question,
        timeLeft: data.timeLeft,
        optionsCount: data.poll?.options?.length
      })
      
      dispatch(setPoll(data.poll))
      dispatch(setTimeLeft(data.timeLeft))
      dispatch(setStatus(POLL_STATUS.ACTIVE))
      dispatch(setResults([])) // Clear previous results
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
      console.log('⏰ Timer update received:', data.timeLeft)
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

    socket.on(SOCKET_EVENTS.KICKED_OUT, () => {
      console.log('🚪 Student kicked out')
      window.location.href = '/kicked-out'
    })

    // Chat events
    socket.on('message_received', (data) => {
      dispatch(addMessage(data))
    })

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket listeners')
      // Remove all listeners but keep connection alive
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
      socket.off(SOCKET_EVENTS.ERROR)
      socket.off(SOCKET_EVENTS.TEACHER_JOINED)
      socket.off(SOCKET_EVENTS.STUDENT_JOINED)
      socket.off(SOCKET_EVENTS.POLL_CREATED)
      socket.off(SOCKET_EVENTS.POLL_ENDED)
      socket.off(SOCKET_EVENTS.RESULTS_UPDATED)
      socket.off(SOCKET_EVENTS.TIMER_UPDATE)
      socket.off(SOCKET_EVENTS.STUDENT_LIST_UPDATED)
      socket.off(SOCKET_EVENTS.POLL_HISTORY)
      socket.off(SOCKET_EVENTS.KICKED_OUT)
      socket.off('message_received')
    }
  }, [dispatch])

  return socketManager.getSocket()
}