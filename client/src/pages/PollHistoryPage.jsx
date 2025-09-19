import React from 'react'
import { useNavigate } from 'react-router-dom'
import PollHistory from '../components/teacher/PollHistory'

const PollHistoryPage = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/teacher')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-[#7765DA] hover:text-[#4F0DCE] transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Teacher Dashboard
        </button>

        {/* Poll History Component */}
        <PollHistory />
      </div>
    </div>
  )
}

export default PollHistoryPage
