import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { USER_ROLES, SOCKET_EVENTS } from '../utils/constants'
import { useSocket } from '../hooks/useSocket'
import Header from '../components/common/Header'
import Timer from '../components/common/Timer'
import StudentLogin from '../components/student/StudentLogin'
import StudentDashboard from '../components/student/StudentDashboard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const StudentPage = () => {
  const { role, name, isConnected } = useSelector(state => state.auth)
  const { socket } = useSelector(state => state.poll)
  const navigate = useNavigate()
  const socketConnection = useSocket()
  const dispatch = useDispatch()

  useEffect(() => {
    // Redirect if not student
    if (role && role !== USER_ROLES.STUDENT) {
      navigate('/')
      return
    }

    // Join as student when connected and name is set
    if (socket && isConnected && name && !name.includes('joined')) {
      console.log('Joining as student:', name)
      socket.emit(SOCKET_EVENTS.JOIN_AS_STUDENT, { name })
    }
  }, [role, navigate, socket, isConnected, name])

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
      <Header />
      <Timer />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {!name ? (
          <StudentLogin />
        ) : (
          <StudentDashboard />
        )}
      </div>
    </div>
  )
}

export default StudentPage