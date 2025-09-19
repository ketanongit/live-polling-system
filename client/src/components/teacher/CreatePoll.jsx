import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { SOCKET_EVENTS } from '../../utils/constants'
import Button from '../common/Button'

const CreatePoll = () => {
  const { socket } = useSelector(state => state.poll)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [correctAnswers, setCorrectAnswers] = useState([false, false])
  const [timeLimit, setTimeLimit] = useState(60)
  const [creating, setCreating] = useState(false)

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ''])
      setCorrectAnswers([...correctAnswers, false])
    }
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
      setCorrectAnswers(correctAnswers.filter((_, i) => i !== index))
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleCorrectAnswerChange = (index, isCorrect) => {
    const newCorrectAnswers = [...correctAnswers]
    newCorrectAnswers[index] = isCorrect
    setCorrectAnswers(newCorrectAnswers)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!question.trim()) return
    
    const validOptions = options.filter(opt => opt.trim())
    if (validOptions.length < 2) return

    if (!socket) return

    setCreating(true)
    
    socket.emit(SOCKET_EVENTS.CREATE_POLL, {
      question: question.trim(),
      options: validOptions.map(opt => opt.trim()),
      correctAnswers: correctAnswers.slice(0, validOptions.length),
      timeLimit
    })

    // Reset form
    setQuestion('')
    setOptions(['', ''])
    setCorrectAnswers([false, false])
    setTimeLimit(60)
    setCreating(false)
  }

  const isValid = question.trim() && options.filter(opt => opt.trim()).length >= 2

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Let's Get Started
          </h1>
          <p className="text-gray-600">
            You'll have the ability to create and manage polls, ask questions, and monitor 
            your students' responses in real-time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                Enter your question
              </label>
              <div className="flex items-center space-x-2">
                <label htmlFor="timeLimit" className="text-sm font-medium text-gray-700">
                  Time Limit:
                </label>
                <select
                  id="timeLimit"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                  <option value={120}>2 minutes</option>
                  <option value={180}>3 minutes</option>
                </select>
              </div>
            </div>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is your question?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500">
              {question.length}/500
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Edit Options
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Is it Correct?
              </label>
            </div>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    maxLength={100}
                  />
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={correctAnswers[index] === true}
                        onChange={() => handleCorrectAnswerChange(index, true)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center space-x-1">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={correctAnswers[index] === false}
                        onChange={() => handleCorrectAnswerChange(index, false)}
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-3 text-primary hover:text-primary-dark font-medium text-sm flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add More option</span>
              </button>
            )}
          </div>

          <div className="text-center pt-4">
            <Button
              type="submit"
              disabled={!isValid || creating}
              size="lg"
              className="min-w-[200px]"
            >
              {creating ? 'Creating...' : 'Ask Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePoll
