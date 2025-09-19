import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { USER_ROLES, SOCKET_EVENTS } from '../utils/constants'
import { useSocket } from '../hooks/useSocket'
import TeacherDashboard from '../components/teacher/TeacherDashboard'
import CreatePoll from '../components/teacher/CreatePoll'
import PollResults from '../components/teacher/PollResults'
import LoadingSpinner from '../components/common/LoadingSpinner'

const TeacherPage = () => {
  const { role, isConnected } = useSelector(state => state.auth)
  const { currentPoll, status, students } = useSelector(state => state.poll)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const socket = useSocket()


  useEffect(() => {
    console.log('🎓 TeacherPage useEffect - role:', role, 'socket:', !!socket, 'isConnected:', isConnected)
    
    // Set teacher role if not set (for direct navigation to /teacher)
    if (!role) {
      console.log('🎓 TeacherPage: Setting teacher role')
      dispatch({ type: 'auth/setRole', payload: USER_ROLES.TEACHER })
      return
    }
    
    // Redirect if not teacher
    if (role !== USER_ROLES.TEACHER) {
      console.log('🎓 TeacherPage: Redirecting - not teacher role')
      navigate('/')
      return
    }

    // Join as teacher when connected
    if (socket && isConnected) {
      console.log('🎓 TeacherPage: Emitting JOIN_AS_TEACHER, socket ID:', socket.id)
      socket.emit(SOCKET_EVENTS.JOIN_AS_TEACHER)
    } else {
      console.log('🎓 TeacherPage: Not connected yet', { socket: !!socket, isConnected })
    }
  }, [role, socket, isConnected, navigate, dispatch])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Connecting to server...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!currentPoll ? (
          <CreatePoll />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PollResults />
            </div>
            <div>
              <TeacherDashboard />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeacherPage
