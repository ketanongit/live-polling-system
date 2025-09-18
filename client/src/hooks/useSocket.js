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
  setError as setPollError
} from '../store/slices/pollSlice'
import { addMessage } from '../store/slices/chatSlice'

export const useSocket = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const socket = socketManager.connect()
    dispatch(setSocket(socket))

    // Connection events
    socket.on('connect', () => {
      dispatch(setConnected(true))
      dispatch(setError(null)) // Clear any connection errors
      console.log('Connected to server')
    })

    socket.on('disconnect', () => {
      dispatch(setConnected(false))
      console.log('Disconnected from server')
    })

    socket.on('connect_error', (error) => {
      dispatch(setConnected(false))
      dispatch(setError('Unable to connect to server. Please check if the server is running.'))
      console.error('Connection error:', error)
    })

    // Error handling
    socket.on(SOCKET_EVENTS.ERROR, (data) => {
      dispatch(setError(data.message))
      dispatch(setPollError(data.message))
    })

    // Teacher events
    socket.on(SOCKET_EVENTS.TEACHER_JOINED, (data) => {
      dispatch(setPoll(data.currentPoll))
      dispatch(setStudents(data.students))
      dispatch(setResults(data.results))
      dispatch(setTimeLeft(data.timeLeft))
      dispatch(setPollHistory(data.pollHistory))
    })

    // Student events
    socket.on(SOCKET_EVENTS.STUDENT_JOINED, (data) => {
      dispatch(setPoll(data.currentPoll))
      dispatch(setTimeLeft(data.timeLeft))
    })

    // Poll events
    socket.on(SOCKET_EVENTS.POLL_CREATED, (data) => {
      dispatch(setPoll(data.poll))
      dispatch(setTimeLeft(data.timeLeft))
    })

    socket.on(SOCKET_EVENTS.POLL_ENDED, (data) => {
      dispatch(endPoll(data))
    })

    socket.on(SOCKET_EVENTS.RESULTS_UPDATED, (data) => {
      dispatch(setResults(data.results))
      dispatch(updateAnsweredCount({
        answered: data.answered,
        totalParticipants: data.totalParticipants
      }))
    })

    socket.on(SOCKET_EVENTS.TIMER_UPDATE, (data) => {
      dispatch(setTimeLeft(data.timeLeft))
    })

    socket.on(SOCKET_EVENTS.STUDENT_LIST_UPDATED, (data) => {
      dispatch(setStudents(data.students))
    })

    socket.on(SOCKET_EVENTS.POLL_HISTORY, (data) => {
      dispatch(setPollHistory(data.history))
    })

    socket.on(SOCKET_EVENTS.KICKED_OUT, () => {
      window.location.href = '/kicked-out'
    })

    // Chat events
    socket.on('message_received', (data) => {
      dispatch(addMessage(data))
    })

    return () => {
      // Don't disconnect on component unmount, keep connection alive
      // socketManager.disconnect()
    }
  }, [dispatch])

  return socketManager.getSocket()
}