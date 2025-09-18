import React from 'react'
import { useSelector } from 'react-redux'
import { SOCKET_EVENTS } from '../../utils/constants'

const ParticipantsList = () => {
  const { students, socket } = useSelector(state => state.poll)

  const handleRemoveStudent = (studentId) => {
    if (socket && window.confirm('Are you sure you want to remove this student?')) {
      socket.emit(SOCKET_EVENTS.REMOVE_STUDENT, { studentId })
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
        <span className="text-sm text-gray-500">{students.length} students</span>
      </div>
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No students have joined yet
          </p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-900 font-medium">{student.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {student.hasAnswered && (
                  <span className="text-green-600 text-sm">✓ Answered</span>
                )}
                <button
                  onClick={() => handleRemoveStudent(student.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Kick out
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ParticipantsList

