import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearPoll } from '../../store/slices/pollSlice'
import { SOCKET_EVENTS, POLL_STATUS } from '../../utils/constants'
import Button from '../common/Button'

const PollControls = () => {
  const { currentPoll, students, answeredCount, totalParticipants, status, timeLeft } = useSelector(state => state.poll)
  const { socket } = useSelector(state => state.poll)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleNewQuestion = () => {
    if (socket) {
      // Notify server to clear poll
      socket.emit(SOCKET_EVENTS.CLEAR_POLL)
      // Also clear client state
      dispatch(clearPoll())
    }
  }

  // Determine if teacher can create a new poll
  const canCreateNew = () => {
    // No current poll - can create
    if (!currentPoll) {
      return true
    }
    
    // Poll ended - can create
    if (status === POLL_STATUS.ENDED || timeLeft <= 0) {
      return true
    }
    
    // All students have answered - can create
    if (students.length > 0) {
      const allAnswered = students.every(student => student.hasAnswered)
      return allAnswered
    }
    
    // No students - can create
    return students.length === 0
  }

  const getButtonText = () => {
    if (!currentPoll) {
      return '+ Ask a new question'
    }
    
    if (status === POLL_STATUS.ENDED || timeLeft <= 0) {
      return '+ Ask a new question'
    }
    
    if (students.length === 0) {
      return '+ Ask a new question'
    }
    
    const allAnswered = students.every(student => student.hasAnswered)
    if (allAnswered) {
      return '+ Ask a new question'
    }
    
    return 'Waiting for all students to answer'
  }

  const getButtonTooltip = () => {
    if (canCreateNew()) {
      return 'Create a new poll question'
    }
    
    const unansweredStudents = students.filter(student => !student.hasAnswered)
    if (unansweredStudents.length > 0) {
      return `Waiting for: ${unansweredStudents.map(s => s.name).join(', ')}`
    }
    
    return 'Cannot create new poll yet'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#F2F2F2] p-6">
      <h3 className="text-xl font-bold text-[#373737] mb-6">Poll Controls</h3>
      
      <div className="space-y-4">
        {currentPoll && (
          <>
            <div className="flex items-center justify-between p-4 bg-[#F2F2F2] rounded-lg">
              <span className="text-[#6E6E6E] font-medium">Answered:</span>
              <span className="font-bold text-[#373737] text-lg">
                {answeredCount} / {totalParticipants}
              </span>
            </div>
            
            {status === POLL_STATUS.ACTIVE && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-600 font-medium">Poll Status:</span>
                <span className="font-bold text-blue-900">
                  Active ({timeLeft}s remaining)
                </span>
              </div>
            )}
            
            {status === POLL_STATUS.ENDED && (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-600 font-medium">Poll Status:</span>
                <span className="font-bold text-green-900">Completed</span>
              </div>
            )}
          </>
        )}

        <div className="space-y-3">
          <div title={getButtonTooltip()}>
            <Button
              onClick={handleNewQuestion}
              disabled={!canCreateNew()}
              className="w-full bg-gradient-to-r from-[#7765DA] to-[#5767D0] hover:from-[#4F0DCE] hover:to-[#7765DA] text-white border-0"
            >
              {getButtonText()}
            </Button>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => navigate('/teacher/history')}
            className="w-full border-2 border-[#7765DA] text-[#7765DA] hover:bg-[#7765DA] hover:text-white transition-colors"
          >
            View Poll History
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PollControls