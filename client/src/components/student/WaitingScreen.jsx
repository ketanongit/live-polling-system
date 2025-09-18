import React from 'react'
import LoadingSpinner from '../common/LoadingSpinner'

const WaitingScreen = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <LoadingSpinner size="lg" className="mx-auto mb-6" />
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Wait for the teacher to ask questions..
      </h2>
      <p className="text-gray-600">
        You'll see the question here once the teacher starts a new poll.
      </p>
    </div>
  )
}

export default WaitingScreen
