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
      dispatch(setAnswered({
        optionIndex: data.optionIndex,
        isCorrect: data.isCorrect
      }))
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#373737]">
            Question 1
          </h2>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-500 font-bold text-lg">
              {formatTime(displayTime)}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white border-2 border-[#7765DA] rounded-lg p-6 mb-6">
          {/* Question Bar */}
          <div className="bg-[#373737] text-white p-4 rounded-lg mb-6">
            <p className="font-medium text-lg">{currentPoll.question}</p>
          </div>

          {/* Answer Options */}
          {isTimeUp ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-red-600 mb-2">Time's Up!</h3>
              <p className="text-gray-600">Please wait for the results...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentPoll.options?.map((option, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                    ${selectedOption === index 
                      ? 'border-white bg-[#7765DA] text-white' 
                      : 'border-[#F2F2F2] bg-[#F2F2F2] text-[#373737] hover:border-[#6E6E6E]'
                    }
                    ${(submitting || isTimeUp) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => !(submitting || isTimeUp) && setSelectedOption(index)}
                >
                  {/* Number Badge */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0
                    ${selectedOption === index 
                      ? 'bg-[#7765DA] text-white' 
                      : 'bg-[#6E6E6E] text-white'
                    }
                  `}>
                    {index + 1}
                  </div>
                  
                  {/* Option Text */}
                  <span className="font-medium text-lg">{option}</span>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  No options available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        {!isTimeUp && (
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={selectedOption === null || submitting || !socket || isTimeUp}
              className="min-w-[120px] bg-gradient-to-r from-[#7765DA] to-[#5767D0] hover:from-[#4F0DCE] hover:to-[#7765DA] text-white border-0"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        )}

        {/* Status Messages */}
        {selectedOption === null && !isTimeUp && (
          <div className="text-center mt-4">
            <p className="text-sm text-[#6E6E6E]">
              Please select an option to submit
            </p>
          </div>
        )}
        
        {!socket && (
          <div className="text-center mt-4">
            <p className="text-sm text-red-500">
              Connection lost. Please refresh the page.
            </p>
          </div>
        )}
        
        {displayTime <= 30 && displayTime > 10 && (
          <div className="text-center mt-4">
            <p className="text-sm text-orange-600">
              ⚠️ Hurry up! Only {displayTime} seconds left
            </p>
          </div>
        )}
        
        {displayTime <= 10 && displayTime > 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-red-600 font-semibold animate-pulse">
              🚨 Almost out of time! {displayTime} seconds remaining
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnswerPoll