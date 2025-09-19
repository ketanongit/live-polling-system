import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

class SocketManager {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket || this.socket.disconnected) {
      console.log('Connecting to:', SOCKET_URL);
      this.socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        maxReconnectionAttempts: 10,
        timeout: 20000,
        transports: ['websocket', 'polling']
      });

      // Add connection logging
      this.socket.on('connect', () => {
        console.log('✅ Connected to server successfully');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketManager = new SocketManager();
export default socketManager;
