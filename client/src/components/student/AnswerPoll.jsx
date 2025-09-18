import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setAnswered, setError } from '../../store/slices/pollSlice'
import { SOCKET_EVENTS } from '../../utils/constants'
import Button from '../common/Button'

const AnswerPoll = () => {
  const { currentPoll, timeLeft, socket } = useSelector(state => state.poll)
  const [selectedOption, setSelectedOption] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [localTimeLeft, setLocalTimeLeft] = useState(timeLeft)
  const dispatch = useDispatch()

  // Sync local timer with redux timer
  useEffect(() => {
    setLocalTimeLeft(timeLeft)
  }, [timeLeft])

  // Local timer countdown for immediate feedback
  useEffect(() => {
    if (localTimeLeft > 0) {
      const timer = setTimeout(() => {
        setLocalTimeLeft(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [localTimeLeft])

  const handleSubmit = () => {
    if (selectedOption === null || !socket || submitting) return

    setSubmitting(true)
    
    console.log('Submitting answer:', selectedOption)
    
    socket.emit(SOCKET_EVENTS.SUBMIT_ANSWER, { 
      optionIndex: selectedOption 
    })

    // Listen for confirmation
    const handleAnswerSubmitted = (data) => {
      console.log('Answer submitted successfully:', data)
      dispatch(setAnswered(selectedOption))
      setSubmitting(false)
      socket.off(SOCKET_EVENTS.ANSWER_SUBMITTED, handleAnswerSubmitted)
      socket.off(SOCKET_EVENTS.ERROR, handleError)
    }

    // Handle errors
    const handleError = (data) => {
      console.error('Answer submission error:', data.message)
      dispatch(setError(data.message))
      setSubmitting(false)
      socket.off(SOCKET_EVENTS.ANSWER_SUBMITTED, handleAnswerSubmitted)
      socket.off(SOCKET_EVENTS.ERROR, handleError)
    }

    socket.once(SOCKET_EVENTS.ANSWER_SUBMITTED, handleAnswerSubmitted)
    socket.once(SOCKET_EVENTS.ERROR, handleError)

    // Timeout fallback
    setTimeout(() => {
      if (submitting) {
        console.log('Answer submission timeout')
        setSubmitting(false)
        socket.off(SOCKET_EVENTS.ANSWER_SUBMITTED, handleAnswerSubmitted)
        socket.off(SOCKET_EVENTS.ERROR, handleError)
      }
    }, 5000)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentPoll) {
    console.log('No current poll in AnswerPoll component')
    return null
  }

  const displayTime = Math.max(localTimeLeft, timeLeft)
  const isTimeUp = displayTime <= 0

  console.log('Rendering AnswerPoll:', { 
    question: currentPoll.question, 
    optionsCount: currentPoll.options?.length,
    timeLeft,
    localTimeLeft,
    displayTime,
    selectedOption,
    submitting
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Question 1
            </h2>
            <div className={`font-medium text-lg px-3 py-1 rounded-lg ${
              displayTime <= 10 
                ? 'text-white bg-red-600 animate-pulse' 
                : displayTime <= 30
                ? 'text-red-700 bg-red-100'
                : 'text-red-600 bg-red-50'
            }`}>
              {formatTime(displayTime)}
            </div>
          </div>
          
          <div className="bg-gray-500 text-white p-4 rounded-lg mb-6">
            <p className="font-medium">{currentPoll.question}</p>
          </div>

          {isTimeUp ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-red-600 mb-2">Time's Up!</h3>
              <p className="text-gray-600">Please wait for the results...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentPoll.options?.map((option, index) => (
                <label
                  key={index}
                  className={`
                    flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                    ${selectedOption === index 
                      ? 'border-purple-600 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${(submitting || isTimeUp) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name="poll-option"
                    value={index}
                    checked={selectedOption === index}
                    onChange={() => !(submitting || isTimeUp) && setSelectedOption(index)}
                    className="sr-only"
                    disabled={submitting || isTimeUp}
                  />
                  <div className={`
                    w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                    ${selectedOption === index ? 'border-purple-600' : 'border-gray-300'}
                  `}>
                    {selectedOption === index && (
                      <div className="w-3 h-3 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <span className="text-gray-900 font-medium">{option}</span>
                </label>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  No options available
                </div>
              )}
            </div>
          )}
        </div>

        {!isTimeUp && (
          <div className="text-center">
            <Button
              onClick={handleSubmit}
              disabled={selectedOption === null || submitting || !socket || isTimeUp}
              className="min-w-[120px]"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
            
            {selectedOption === null && (
              <p className="text-sm text-gray-500 mt-2">
                Please select an option to submit
              </p>
            )}
            
            {!socket && (
              <p className="text-sm text-red-500 mt-2">
                Connection lost. Please refresh the page.
              </p>
            )}
            
            {displayTime <= 30 && displayTime > 10 && (
              <p className="text-sm text-orange-600 mt-2">
                ⚠️ Hurry up! Only {displayTime} seconds left
              </p>
            )}
            
            {displayTime <= 10 && displayTime > 0 && (
              <p className="text-sm text-red-600 mt-2 font-semibold animate-pulse">
                🚨 Almost out of time! {displayTime} seconds remaining
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnswerPoll