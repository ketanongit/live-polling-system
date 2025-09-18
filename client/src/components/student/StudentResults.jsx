import React from 'react'
import { useSelector } from 'react-redux'

const StudentResults = () => {
  const { currentPoll, results, selectedOption, totalParticipants } = useSelector(state => state.poll)

  if (!currentPoll || !results.length) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Wait for the teacher to ask a new question
        </h2>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Question 1
            </h2>
            <div className="text-red-600 font-medium">
              00:15
            </div>
          </div>
          
          <div className="bg-gray-medium text-white p-4 rounded-lg mb-6">
            <p className="font-medium">{currentPoll.question}</p>
          </div>

          <div className="space-y-3 mb-8">
            {results.map((result, index) => {
              const isSelected = selectedOption === index
              return (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg border-2
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {result.option}
                    </span>
                    <span className="font-bold text-gray-900">
                      {result.percentage}%
                    </span>
                  </div>
                  <div className="progress-bar h-3">
                    <div 
                      className="progress-fill"
                      style={{ width: `${result.percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Participants:</span>
              <span className="font-semibold text-gray-900">{totalParticipants}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Wait for the teacher to ask a new question
          </p>
        </div>
      </div>
    </div>
  )
}

export default StudentResults
