import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { reset as resetAuth } from '../store/slices/authSlice'
import { reset as resetPoll } from '../store/slices/pollSlice'
import VectorIcon from '/Vector.svg'

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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Intervue Poll Badge */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white px-3 py-1 rounded-full text-sm font-medium">
            <img src={VectorIcon} alt="Intervue Poll" className="w-4 h-4" />
            Intervue Poll
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl font-bold text-[#373737] mb-4">
          You've been Kicked out!
        </h1>

        {/* Descriptive Text */}
        <p className="text-lg text-[#373737]">
          Looks like the teacher had removed you from the poll system. Please Try again sometime.
        </p>
      </div>
    </div>
  )
}

export default KickedOutPage