import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { reset as resetAuth } from '../store/slices/authSlice'
import { reset as resetPoll } from '../store/slices/pollSlice'
import Header from '../components/common/Header'
import Button from '../components/common/Button'

const KickedOutPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleTryAgain = () => {
    // Reset all state
    dispatch(resetAuth())
    dispatch(resetPoll())
    
    // Navigate back to home
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center">
          <div className="mb-8">
            <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              You've been Kicked out !
            </h1>
            
            <p className="text-gray-600 mb-8">
              Looks like the teacher has removed you from the poll system. Please try again sometime.
            </p>
          </div>

          <Button onClick={handleTryAgain} size="lg">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}

export default KickedOutPage
