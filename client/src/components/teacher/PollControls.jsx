import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearPoll } from '../../store/slices/pollSlice'
import { SOCKET_EVENTS, POLL_STATUS } from '../../utils/constants'
import Button from '../common/Button'
import Modal from '../common/Modal'
import PollHistory from './PollHistory'

const PollControls = () => {
  const { currentPoll, students, answeredCount, totalParticipants, status, timeLeft } = useSelector(state => state.poll)
  const { socket } = useSelector(state => state.poll)
  const [showHistory, setShowHistory] = useState(false)
  const dispatch = useDispatch()

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
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Poll Controls</h3>
      
      <div className="space-y-4">
        {/* <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Active Students:</span>
          <span className="font-semibold text-gray-900">{students.length}</span>
        </div> */}
        
        {currentPoll && (
          <>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Answered:</span>
              <span className="font-semibold text-gray-900">
                {answeredCount} / {totalParticipants}
              </span>
            </div>
            
            {status === POLL_STATUS.ACTIVE && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-600">Poll Status:</span>
                <span className="font-semibold text-blue-900">
                  Active ({timeLeft}s remaining)
                </span>
              </div>
            )}
            
            {status === POLL_STATUS.ENDED && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-600">Poll Status:</span>
                <span className="font-semibold text-green-900">Completed</span>
              </div>
            )}
          </>
        )}

        <div className="space-y-2">
          <div title={getButtonTooltip()}>
            <Button
              onClick={handleNewQuestion}
              disabled={!canCreateNew()}
              className="w-full"
            >
              {getButtonText()}
            </Button>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => setShowHistory(true)}
            className="w-full"
          >
            View Poll History
          </Button>
        </div>
        

      </div>

      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="Poll History"
        className="sm:max-w-4xl"
      >
        <PollHistory onClose={() => setShowHistory(false)} />
      </Modal>
    </div>
  )
}

export default PollControls