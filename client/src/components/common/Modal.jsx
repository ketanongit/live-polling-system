import React from 'react'

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        onClick={onClose}
      />
      
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
        {/* Modal */}
        <div className={`
          inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all 
          w-full relative z-50 sm:max-w-lg ${className}
        `}>
          {title && (
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
            </div>
          )}
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
