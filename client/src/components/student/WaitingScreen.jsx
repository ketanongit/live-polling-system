import React from 'react'
import VectorIcon from '/Vector.svg'

const WaitingScreen = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Intervue Poll Badge */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white px-3 py-1 rounded-full text-sm font-medium">
            <img src={VectorIcon} alt="Intervue Poll" className="w-4 h-4" />
            Intervue Poll
          </div>
        </div>

        {/* Purple Loading Spinner */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto">
            <div className="w-16 h-16 border-4 border-[#7765DA] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Waiting Text */}
        <h2 className="text-lg font-medium text-[#373737]">
          Wait for the teacher to ask questions..
        </h2>
      </div>
    </div>
  )
}

export default WaitingScreen