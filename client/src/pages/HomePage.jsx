import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setRole } from '../store/slices/authSlice'
import { USER_ROLES } from '../utils/constants'
import Button from '../components/common/Button'
import VectorIcon from '/Vector.svg'

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
    const selectedClasses = selectedRole === role ? 'border-[#7765DA]' : 'border-[#F2F2F2] hover:border-[#6E6E6E]'
    return `${baseClasses} ${selectedClasses}`
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Centered Intervue Poll Badge */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white px-3 py-1 rounded-full text-sm font-medium mb-8">
            <img src={VectorIcon} alt="Intervue Poll" className="w-4 h-4" />
            Intervue Poll
          </div>
          
          <h1 className="text-4xl font-medium text-[#373737] mb-4">
            Welcome to the <span className="font-bold">Live Polling System</span>
          </h1>
          <p className="text-lg text-[#6E6E6E] max-w-2xl mx-auto">
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
                <h3 className="text-xl font-semibold text-[#373737] mb-2">
                  I'm a Student
                </h3>
                <p className="text-[#6E6E6E]">
                  Submit answers and view live poll results in real-time. Participate in live polls and see how your responses compare with your classmates.
                </p>
              </div>
            </div>

            {/* Teacher Card */}
            <div 
              className={getCardClasses(USER_ROLES.TEACHER)}
              onClick={() => handleRoleSelect(USER_ROLES.TEACHER)}
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#373737] mb-2">
                  I'm a Teacher
                </h3>
                <p className="text-[#6E6E6E]">
                  Create questions and view live poll results in real-time.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleContinue}
              disabled={!selectedRole}
              size="lg"
              className="min-w-[200px] bg-gradient-to-r from-[#7765DA] to-[#5767D0] hover:from-[#4F0DCE] hover:to-[#7765DA] text-white border-0"
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