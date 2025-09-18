import { useState, useEffect } from 'react'

export const useTimer = (initialTime, onComplete) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    setTimeLeft(initialTime)
  }, [initialTime])

  useEffect(() => {
    let interval = null
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsActive(false)
            onComplete && onComplete()
            return 0
          }
          return timeLeft - 1
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, onComplete])

  const start = () => setIsActive(true)
  const stop = () => setIsActive(false)
  const reset = (newTime = initialTime) => {
    setTimeLeft(newTime)
    setIsActive(false)
  }

  return { timeLeft, isActive, start, stop, reset }
}
