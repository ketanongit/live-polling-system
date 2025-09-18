import React from 'react'
import { useSelector } from 'react-redux'
import AnswerPoll from './AnswerPoll'
import WaitingScreen from './WaitingScreen'
import StudentResults from './StudentResults'

const StudentDashboard = () => {
  const { currentPoll, hasAnswered, status } = useSelector(state => state.poll)

  if (!currentPoll || status === 'waiting') {
    return <WaitingScreen />
  }

  if (status === 'ended' || hasAnswered) {
    return <StudentResults />
  }

  return <AnswerPoll />
}

export default StudentDashboard
