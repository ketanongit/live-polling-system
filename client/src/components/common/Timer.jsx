import React from 'react'
import { useSelector } from 'react-redux'

const Timer = () => {
  const { timeLeft, status } = useSelector(state => state.poll)
  
  if (status !== 'active') return null
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const isUrgent = timeLeft <= 10
  
  return (
    <div className={`
      fixed top-4 right-4 z-40 px-4 py-2 rounded-lg font-bold text-lg
      ${isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-red-100 text-red-600'}
    `}>
      {formatTime(timeLeft)}
    </div>
  )
}

export default Timer