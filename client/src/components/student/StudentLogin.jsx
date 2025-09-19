import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setName, setError, clearError } from '../../store/slices/authSlice'
import { SOCKET_EVENTS } from '../../utils/constants'
import Button from '../common/Button'
import { useSocket } from '../../hooks/useSocket'
import VectorIcon from '/Vector.svg'

const StudentLogin = () => {
  const [inputName, setInputName] = useState('')
  const { error, loading } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const socket = useSocket()

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!inputName.trim()) {
      dispatch(setError('Please enter your name'))
      return
    }

    if (!socket) {
      dispatch(setError('Connection error. Please refresh the page.'))
      return
    }

    dispatch(clearError())
    
    socket.emit(SOCKET_EVENTS.JOIN_AS_STUDENT, { 
      name: inputName.trim() 
    })

    socket.once(SOCKET_EVENTS.STUDENT_JOINED, () => {
      dispatch(setName(inputName.trim()))
    })
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          {/* Intervue Poll Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white px-3 py-1 rounded-full text-sm font-medium">
              <img src={VectorIcon} alt="Intervue Poll" className="w-4 h-4" />
              Intervue Poll
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl font-bold text-[#373737] mb-4">
            Let's Get Started
          </h1>

          {/* Description */}
          <p className="text-lg text-[#6E6E6E] mb-8">
            If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-left">
              <label htmlFor="name" className="block text-lg font-medium text-[#373737] mb-3">
                Enter your Name
              </label>
              <input
                type="text"
                id="name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="your name"
                className="w-full px-4 py-4 bg-[#F2F2F2] border border-[#F2F2F2] rounded-lg focus:ring-2 focus:ring-[#7765DA] focus:border-transparent text-[#373737] placeholder-[#6E6E6E]"
                maxLength={50}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="text-center">
              <Button
                type="submit"
                className="min-w-[200px] bg-gradient-to-r from-[#7765DA] to-[#5767D0] hover:from-[#4F0DCE] hover:to-[#7765DA] text-white border-0"
                disabled={loading || !inputName.trim()}
              >
                Continue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StudentLogin