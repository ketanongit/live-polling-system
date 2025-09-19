import React from 'react'
import { useSelector } from 'react-redux'
import { POLL_STATUS } from '../../utils/constants'

const StudentResults = () => {
  const { currentPoll, results, selectedOption, isAnswerCorrect, totalParticipants, timeLeft, status } = useSelector(state => state.poll)

  if (!currentPoll) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-[#373737] mb-4">
            Wait for the teacher to ask a new question
          </h2>
          <p className="text-lg text-[#6E6E6E]">
            You'll see the next question here once the teacher starts a new poll.
          </p>
        </div>
      </div>
    )
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const showTimer = status === POLL_STATUS.ACTIVE && timeLeft > 0

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#373737]">
            Question 1
          </h2>
          {showTimer && (
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-500 font-bold text-lg">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          {!showTimer && (
            <div className="text-[#6E6E6E] font-medium text-lg">
              Poll Ended
            </div>
          )}
        </div>
        
        {/* Question Box */}
        <div className="bg-[#373737] text-white p-4 rounded-lg mb-6">
          <p className="font-medium text-lg">{currentPoll.question}</p>
        </div>

        {showTimer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <div className="text-blue-700 font-medium">
                📊 Viewing live results - poll is still active
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4 mb-8">
          {results && results.length > 0 ? (
            results.map((result, index) => {
              const isSelected = selectedOption === index
              const isCorrect = result.isCorrect
              return (
                <div
                  key={index}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-300 overflow-hidden
                    ${isSelected 
                      ? showTimer
                        ? 'border-[#7765DA] bg-[#7765DA] text-white'
                        : isCorrect 
                          ? 'border-green-600 bg-green-50' 
                          : 'border-red-600 bg-red-50'
                      : showTimer
                        ? 'border-[#F2F2F2] bg-[#F2F2F2] text-[#373737]'
                        : isCorrect 
                          ? 'border-green-300 bg-green-25' 
                          : 'border-[#F2F2F2] bg-[#F2F2F2] text-[#373737]'
                    }
                  `}
                >
                  {/* Progress Bar Background */}
                  <div 
                    className={`absolute inset-0 rounded-lg transition-all duration-500 ease-out ${
                      showTimer 
                        ? 'bg-[#7765DA]' 
                        : isCorrect ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${result.percentage}%` }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Number Badge */}
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                        ${isSelected 
                          ? 'bg-[#7765DA] text-white' 
                          : 'bg-[#6E6E6E] text-white'
                        }
                      `}>
                        {index + 1}
                      </div>
                      
                      {/* Option Text */}
                      <span className="font-medium text-lg">
                        {result.option}
                      </span>
                      
                      {/* Status Indicators */}
                      {!showTimer && isCorrect && (
                        <span className="text-green-600 font-semibold text-sm">
                          ✓ Correct
                        </span>
                      )}
                      {isSelected && (
                        <span className={`ml-2 text-sm font-semibold ${
                          showTimer 
                            ? 'text-white' 
                            : isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {showTimer 
                            ? '✓ Your Answer' 
                            : isCorrect ? '✓ Your Answer (Correct!)' : '✗ Your Answer (Incorrect)'
                          }
                        </span>
                      )}
                    </div>
                    
                    {/* Percentage */}
                    <span className="font-bold text-lg">
                      {result.percentage}%
                    </span>
                  </div>
                  
                  {/* Response Count */}
                  <div className="relative z-10 text-sm mt-2 opacity-75">
                    {result.count} {result.count === 1 ? 'response' : 'responses'}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="text-[#6E6E6E] mb-2">📊 Collecting responses...</div>
                <div className="text-sm text-[#6E6E6E]">Results will appear here as students submit their answers</div>
              </div>
            </div>
          )}
        </div>

        {/* Total Participants */}
        <div className="bg-[#F2F2F2] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-[#6E6E6E]">Total Participants:</span>
            <span className="font-semibold text-[#373737]">{totalParticipants || 0}</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center">
          {showTimer ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700 font-medium">
                ⏳ Poll is still active - results are updating in real-time
              </p>
            </div>
          ) : selectedOption !== null && isAnswerCorrect !== null ? (
            <div className={`border rounded-lg p-4 ${
              showTimer
                ? 'bg-blue-50 border-blue-200'
                : isAnswerCorrect 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
            }`}>
              <div className={`text-lg font-semibold ${
                showTimer
                  ? 'text-blue-700'
                  : isAnswerCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {showTimer 
                  ? '✅ Answer Submitted!' 
                  : isAnswerCorrect ? '🎉 Correct Answer!' : '❌ Incorrect Answer'
                }
              </div>
              <p className={`text-sm mt-1 ${
                showTimer
                  ? 'text-blue-600'
                  : isAnswerCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {showTimer 
                  ? 'Your answer has been recorded. Wait for the poll to end to see if you got it right!'
                  : isAnswerCorrect 
                    ? 'Great job! You selected the correct answer.' 
                    : 'Better luck next time! Check the correct answers above.'
                }
              </p>
            </div>
          ) : (
            <p className="text-[#6E6E6E]">
              Wait for the teacher to ask a new question
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentResults