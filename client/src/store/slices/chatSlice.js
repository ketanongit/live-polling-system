import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  messages: [],
  isOpen: false,
  unreadCount: 0
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date()
      })
      if (!state.isOpen) {
        state.unreadCount += 1
      }
    },
    
    toggleChat: (state) => {
      state.isOpen = !state.isOpen
      if (state.isOpen) {
        state.unreadCount = 0
      }
    },
    
    openChat: (state) => {
      state.isOpen = true
      state.unreadCount = 0
    },
    
    closeChat: (state) => {
      state.isOpen = false
    },
    
    clearMessages: (state) => {
      state.messages = []
      state.unreadCount = 0
    },
    
    markAsRead: (state) => {
      state.unreadCount = 0
    }
  }
})

export const {
  addMessage,
  toggleChat,
  openChat,
  closeChat,
  clearMessages,
  markAsRead
} = chatSlice.actions

export default chatSlice.reducer
