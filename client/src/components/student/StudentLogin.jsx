import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setName, setError, clearError } from '../../store/slices/authSlice'
import { SOCKET_EVENTS } from '../../utils/constants'
import Button from '../common/Button'
import { useSocket } from '../../hooks/useSocket'

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
              Intervue Poll
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Let's Get Started
            </h1>
            <p className="text-gray-600">
              If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live
              polls, and see how your responses compare with your classmates
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your Name
              </label>
              <input
                type="text"
                id="name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                maxLength={50}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !inputName.trim()}
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StudentLogin
