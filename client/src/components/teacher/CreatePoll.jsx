import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { SOCKET_EVENTS } from '../../utils/constants'
import Button from '../common/Button'
import VectorIcon from '/Vector.svg'

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
      {/* Intervue Poll Badge */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7765DA] to-[#5767D0] text-white px-3 py-1 rounded-full text-sm font-medium">
          <img src={VectorIcon} alt="Intervue Poll" className="w-4 h-4" />
           Intervue Poll
        </div>
      </div>

      <div className="bg-white">
        <div className="mb-8">
          <h1 className="text-4xl font-medium text-[#373737] mb-4">
            Let's <span className="font-bold">Get Started</span>
          </h1>
          <p className="text-lg text-[#6E6E6E]">
            you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="question" className="block text-lg font-medium text-[#373737]">
                Enter your question
              </label>
              <div className="flex items-center">
                <select
                  id="timeLimit"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="px-4 py-2 bg-[#F2F2F2] border border-[#F2F2F2] rounded-full text-sm text-[#373737] focus:ring-2 focus:ring-[#7765DA] focus:border-transparent appearance-none pr-8"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                  <option value={120}>2 minutes</option>
                  <option value={180}>3 minutes</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-[#6E6E6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="relative">
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What is your question?"
                rows={4}
                className="w-full px-4 py-4 bg-[#F2F2F2] border border-[#F2F2F2] rounded-lg focus:ring-2 focus:ring-[#7765DA] focus:border-transparent resize-none text-[#373737] placeholder-[#6E6E6E]"
                maxLength={100}
              />
              <div className="absolute bottom-3 right-3 text-sm text-[#6E6E6E]">
                {question.length}/100
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <label className="block text-lg font-medium text-[#373737]">
                Edit Options
              </label>
              <label className="block text-lg font-medium text-[#373737]">
                Is it Correct?
              </label>
            </div>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-[#7765DA] text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-3 bg-[#F2F2F2] border border-[#F2F2F2] rounded-lg focus:ring-2 focus:ring-[#7765DA] focus:border-transparent text-[#373737] placeholder-[#6E6E6E]"
                    maxLength={100}
                  />
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={correctAnswers[index] === true}
                        onChange={() => handleCorrectAnswerChange(index, true)}
                        className="w-4 h-4 text-[#7765DA] focus:ring-[#7765DA] border-gray-300"
                      />
                      <span className="text-sm text-[#373737]">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={correctAnswers[index] === false}
                        onChange={() => handleCorrectAnswerChange(index, false)}
                        className="w-4 h-4 text-[#7765DA] focus:ring-[#7765DA] border-gray-300"
                      />
                      <span className="text-sm text-[#373737]">No</span>
                    </label>
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-500 hover:text-red-700 flex-shrink-0"
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
                className="mt-6 px-4 py-2 border-2 border-[#7765DA] text-[#7765DA] rounded-lg font-medium text-sm flex items-center space-x-2 hover:bg-[#7765DA] hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add More option</span>
              </button>
            )}
          </div>

          {/* Ask Question Button */}
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              disabled={!isValid || creating}
              size="lg"
              className="min-w-[200px] bg-gradient-to-r from-[#7765DA] to-[#5767D0] hover:from-[#4F0DCE] hover:to-[#7765DA] text-white border-0"
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