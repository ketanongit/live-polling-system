import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setRole } from '../store/slices/authSlice'
import { USER_ROLES } from '../utils/constants'
import Header from '../components/common/Header'
import Button from '../components/common/Button'

const HomePage = () => {
  const [selectedRole, setSelectedRole] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
  }

  const handleContinue = () => {
    if (selectedRole) {
      dispatch(setRole(selectedRole))
      navigate(selectedRole === USER_ROLES.TEACHER ? '/teacher' : '/student')
    }
  }

  const getCardClasses = (role) => {
    const baseClasses = 'bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-md'
    const selectedClasses = selectedRole === role ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
    return `${baseClasses} ${selectedClasses}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to the <span className="text-purple-600">Live Polling System</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please select the role that best describes you to begin using the live polling system
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Student Card */}
            <div 
              className={getCardClasses(USER_ROLES.STUDENT)}
              onClick={() => handleRoleSelect(USER_ROLES.STUDENT)}
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  I'm a Student
                </h3>
                <p className="text-gray-600">
                  Submit answers and view live poll results in real-time. Participate in live 
                  polls and see how your responses compare with your classmates.
                </p>
              </div>
            </div>

            {/* Teacher Card */}
            <div 
              className={getCardClasses(USER_ROLES.TEACHER)}
              onClick={() => handleRoleSelect(USER_ROLES.TEACHER)}
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  I'm a Teacher
                </h3>
                <p className="text-gray-600">
                  Create and manage polls, ask questions, and monitor 
                  your students' responses in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleContinue}
              disabled={!selectedRole}
              size="lg"
              className="min-w-[200px]"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
