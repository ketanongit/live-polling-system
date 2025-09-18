import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import TeacherPage from './pages/TeacherPage'
import StudentPage from './pages/StudentPage'
import KickedOutPage from './pages/KickedOutPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/kicked-out" element={<KickedOutPage />} />
      </Routes>
    </div>
  )
}

export default App
