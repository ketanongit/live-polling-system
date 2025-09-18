import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setAnswered, setError } from '../../store/slices/pollSlice'
import { SOCKET_EVENTS } from '../../utils/constants'
import Button from '../common/Button'

const AnswerPoll = () => {
  const { currentPoll, timeLeft } = useSelector(state => state.poll)
  const { socket } = useSelector(state => state.poll)
  const [selectedOption, setSelectedOption] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const dispatch = useDispatch()

  const handleSubmit = () => {
    if (selectedOption === null || !socket) return

    setSubmitting(true)
    
    socket.emit(SOCKET_EVENTS.SUBMIT_ANSWER, { 
      optionIndex: selectedOption 
    })

    // Listen for confirmation
    socket.once(SOCKET_EVENTS.ANSWER_SUBMITTED, (data) => {
      dispatch(setAnswered(selectedOption))
      setSubmitting(false)
    })

    // Handle errors
    socket.once(SOCKET_EVENTS.ERROR, (data) => {
      dispatch(setError(data.message))
      setSubmitting(false)
    })
  }

  if (!currentPoll) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Question 1
            </h2>
            <div className="text-red-600 font-medium">
              {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
              {(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
          
          <div className="bg-gray-medium text-white p-4 rounded-lg mb-6">
            <p className="font-medium">{currentPoll.question}</p>
          </div>

          <div className="space-y-3">
            {currentPoll.options.map((option, index) => (
              <label
                key={index}
                className={`
                  flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${selectedOption === index 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="poll-option"
                  value={index}
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                  className="sr-only"
                />
                <div className={`
                  w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                  ${selectedOption === index ? 'border-primary' : 'border-gray-300'}
                `}>
                  {selectedOption === index && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-gray-900 font-medium">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={handleSubmit}
            disabled={selectedOption === null || submitting}
            className="min-w-[120px]"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AnswerPoll

