import React from 'react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '', 
  ...props 
}) => {
  const getButtonClasses = () => {
    const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center'
    
    const variants = {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-300',
      outline: 'border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white focus:ring-purple-500'
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    }
    
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    
    return `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`
  }
  
  return (
    <button
      className={getButtonClasses()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
