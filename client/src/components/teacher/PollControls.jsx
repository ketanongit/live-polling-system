import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearPoll } from '../../store/slices/pollSlice'
import { SOCKET_EVENTS } from '../../utils/constants'
import Button from '../common/Button'
import Modal from '../common/Modal'
import PollHistory from './PollHistory'

const PollControls = () => {
  const { currentPoll, students, answeredCount, totalParticipants } = useSelector(state => state.poll)
  const { socket } = useSelector(state => state.poll)
  const [showHistory, setShowHistory] = useState(false)
  const dispatch = useDispatch()

  const handleNewQuestion = () => {
    if (socket) {
      dispatch(clearPoll())
    }
  }

  const canCreateNew = !currentPoll || students.every(student => student.hasAnswered)

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Poll Controls</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Active Students:</span>
          <span className="font-semibold text-gray-900">{students.length}</span>
        </div>
        
        {currentPoll && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Answered:</span>
            <span className="font-semibold text-gray-900">
              {answeredCount} / {totalParticipants}
            </span>
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={handleNewQuestion}
            disabled={!canCreateNew}
            className="w-full"
          >
            + Ask a new question
          </Button>
          
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
