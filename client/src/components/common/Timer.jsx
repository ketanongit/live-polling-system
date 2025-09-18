import React from 'react'
import { useSelector } from 'react-redux'
import { POLL_STATUS } from '../../utils/constants'

const Timer = () => {
  const { timeLeft, status, currentPoll } = useSelector(state => state.poll)
  
  // Only show timer if there's an active poll
  if (!currentPoll || status !== POLL_STATUS.ACTIVE || timeLeft <= 0) {
    return null
  }
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const isUrgent = timeLeft <= 10
  const isVeryUrgent = timeLeft <= 5
  
  return (
    <div className={`
      fixed top-4 right-4 z-50 px-4 py-2 rounded-lg font-bold text-lg shadow-lg
      ${isVeryUrgent 
        ? 'bg-red-600 text-white animate-pulse' 
        : isUrgent 
        ? 'bg-red-500 text-white' 
        : 'bg-red-100 text-red-700 border border-red-300'
      }
    `}>
      {formatTime(timeLeft)}
    </div>
  )
}

export default Timer