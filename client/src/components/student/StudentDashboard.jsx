import React from 'react'
import { useSelector } from 'react-redux'
import AnswerPoll from './AnswerPoll'
import WaitingScreen from './WaitingScreen'
import StudentResults from './StudentResults'
import { POLL_STATUS } from '../../utils/constants'

const StudentDashboard = () => {
  const { currentPoll, hasAnswered, status, timeLeft } = useSelector(state => state.poll)

  // Debug logging
  console.log('StudentDashboard state:', { 
    currentPoll: !!currentPoll, 
    hasAnswered, 
    status, 
    timeLeft,
    pollQuestion: currentPoll?.question 
  })

  // No poll exists - show waiting screen
  if (!currentPoll) {
    return <WaitingScreen />
  }

  // Poll exists but ended OR student has answered - show results
  if (status === POLL_STATUS.ENDED || hasAnswered || timeLeft <= 0) {
    return <StudentResults />
  }

  // Poll is active and student hasn't answered - show answer form
  if (status === POLL_STATUS.ACTIVE && !hasAnswered && timeLeft > 0) {
    return <AnswerPoll />
  }

  // Fallback to waiting screen
  return <WaitingScreen />
}

export default StudentDashboard