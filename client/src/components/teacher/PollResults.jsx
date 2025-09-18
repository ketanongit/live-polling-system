import React from 'react'
import { useSelector } from 'react-redux'

const PollResults = () => {
  const { currentPoll, results, status, timeLeft } = useSelector(state => state.poll)

  if (!currentPoll) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          No Active Poll
        </h2>
        <p className="text-gray-600">
          Create a new poll to see results here
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Question</h2>
          {status === 'active' && (
            <div className="text-red-600 font-medium">
              {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
              {(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        
        <div className="bg-gray-medium text-white p-4 rounded-lg mb-6">
          <p className="font-medium">{currentPoll.question}</p>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{result.option}</span>
                <span className="font-bold text-gray-900">{result.percentage}%</span>
              </div>
              <div className="progress-bar h-4">
                <div 
                  className="progress-fill flex items-center justify-end pr-2"
                  style={{ width: `${result.percentage}%` }}
                >
                  {result.count > 0 && (
                    <span className="text-white text-sm font-medium">{result.count}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PollResults

