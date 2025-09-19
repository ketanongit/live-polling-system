import React from 'react'
import { useSelector } from 'react-redux'
import { POLL_STATUS } from '../../utils/constants'

const StudentResults = () => {
  const { currentPoll, results, selectedOption, isAnswerCorrect, totalParticipants, timeLeft, status } = useSelector(state => state.poll)

  if (!currentPoll) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Wait for the teacher to ask a new question
          </h2>
          <p className="text-gray-600">
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
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Question 1
            </h2>
            {showTimer && (
              <div className={`font-medium text-lg px-3 py-1 rounded-lg ${
                timeLeft <= 10 
                  ? 'text-white bg-red-600 animate-pulse' 
                  : timeLeft <= 30
                  ? 'text-red-700 bg-red-100'
                  : 'text-red-600 bg-red-50'
              }`}>
                {formatTime(timeLeft)}
              </div>
            )}
            {!showTimer && (
              <div className="text-gray-500 font-medium">
                Poll Ended
              </div>
            )}
          </div>
          
          <div className="bg-gray-500 text-white p-4 rounded-lg mb-6">
            <p className="font-medium">{currentPoll.question}</p>
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

          <div className="space-y-3 mb-8">
            {results && results.length > 0 ? (
              results.map((result, index) => {
                const isSelected = selectedOption === index
                const isCorrect = result.isCorrect
                return (
                  <div
                    key={index}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-300
                      ${isSelected 
                        ? isCorrect 
                          ? 'border-green-600 bg-green-50' 
                          : 'border-red-600 bg-red-50'
                        : isCorrect 
                          ? 'border-green-300 bg-green-25' 
                          : 'border-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {result.option}
                        </span>
                        {isCorrect && (
                          <span className="text-green-600 font-semibold text-sm">
                            ✓ Correct
                          </span>
                        )}
                        {isSelected && (
                          <span className={`ml-2 text-sm font-semibold ${
                            isCorrect ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {isCorrect ? '✓ Your Answer (Correct!)' : '✗ Your Answer (Incorrect)'}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-gray-900">
                        {result.percentage}%
                      </span>
                    </div>
                    <div className="progress-bar h-3">
                      <div 
                        className={`progress-fill transition-all duration-500 ease-out ${
                          isCorrect ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${result.percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {result.count} {result.count === 1 ? 'response' : 'responses'}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="text-gray-500 mb-2">📊 Collecting responses...</div>
                  <div className="text-sm text-gray-400">Results will appear here as students submit their answers</div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Participants:</span>
              <span className="font-semibold text-gray-900">{totalParticipants || 0}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          {showTimer ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700 font-medium">
                ⏳ Poll is still active - results are updating in real-time
              </p>
            </div>
          ) : selectedOption !== null && isAnswerCorrect !== null ? (
            <div className={`border rounded-lg p-4 ${
              isAnswerCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`text-lg font-semibold ${
                isAnswerCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {isAnswerCorrect ? '🎉 Correct Answer!' : '❌ Incorrect Answer'}
              </div>
              <p className={`text-sm mt-1 ${
                isAnswerCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {isAnswerCorrect 
                  ? 'Great job! You selected the correct answer.' 
                  : 'Better luck next time! Check the correct answers above.'
                }
              </p>
            </div>
          ) : (
            <p className="text-gray-600">
              Wait for the teacher to ask a new question
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentResults