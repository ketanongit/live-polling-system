import React from 'react'

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    }
    return sizes[size]
  }
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 ${getSizeClasses()} ${className}`} />
  )
}

export default LoadingSpinner