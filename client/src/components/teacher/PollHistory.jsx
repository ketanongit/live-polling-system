import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { SOCKET_EVENTS } from '../../utils/constants'

const PollHistory = ({ onClose }) => {
  const { pollHistory, socket } = useSelector(state => state.poll)

  useEffect(() => {
    if (socket) {
      socket.emit(SOCKET_EVENTS.GET_POLL_HISTORY)
    }
  }, [socket])

  return (
    <div className="max-h-96 overflow-y-auto">
      {pollHistory.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No poll history available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pollHistory.map((poll, pollIndex) => (
            <div key={poll.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Question {pollIndex + 1}
                </h4>
                <div className="bg-gray-medium text-white p-3 rounded text-sm">
                  {poll.question}
                </div>
              </div>
              
              <div className="space-y-3">
                {poll.results.map((result, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{result.option}</span>
                      <span className="font-medium">{result.percentage}%</span>
                    </div>
                    <div className="progress-bar h-2">
                      <div 
                        className="progress-fill"
                        style={{ width: `${result.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                Total participants: {poll.totalParticipants} | 
                {new Date(poll.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PollHistory
