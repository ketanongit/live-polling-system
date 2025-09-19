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
    <div>
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-[#373737] mb-8">
        View Poll History
      </h1>

        {pollHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6E6E6E] text-lg">No poll history available</p>
          </div>
        ) : (
          <div className="space-y-8">
            {pollHistory.map((poll, pollIndex) => (
              <div key={poll.id} className="space-y-6">
                {/* Question Header */}
                <h2 className="text-2xl font-bold text-[#373737]">
                  Question {pollIndex + 1}
                </h2>

                {/* Question Box */}
                <div className="bg-[#373737] text-white p-4 rounded-lg">
                  <p className="font-medium text-lg">{poll.question}</p>
                </div>

                {/* Answer Options with Progress Bars */}
                <div className="space-y-4">
                  {poll.results.map((result, index) => (
                    <div key={index} className="relative">
                      {/* Option Container */}
                      <div className="flex items-center p-4 bg-[#F2F2F2] rounded-lg relative overflow-hidden">
                        {/* Number Badge */}
                        <div className="w-8 h-8 rounded-full bg-[#7765DA] text-white flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 z-10">
                          {index + 1}
                        </div>
                        
                        {/* Option Text */}
                        <span className="text-[#373737] font-medium text-lg z-10 relative">
                          {result.option}
                        </span>
                        
                        {/* Percentage */}
                        <span className="text-[#373737] font-bold text-lg ml-auto z-10 relative">
                          {result.percentage}%
                        </span>
                        
                        {/* Progress Bar Background */}
                        <div 
                          className="absolute inset-0 bg-[#7765DA] rounded-lg transition-all duration-500 ease-out"
                          style={{ width: `${result.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Poll Metadata */}
                <div className="text-sm text-[#6E6E6E] pt-2">
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