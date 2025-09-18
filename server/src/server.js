const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io setup
const io = socketIo(server, {
  cors: corsOptions
});

// In-memory storage (for development)
const gameState = {
  currentPoll: null,
  students: new Map(), // studentId -> { name, socketId, hasAnswered }
  results: new Map(), // optionIndex -> count
  pollHistory: [],
  timer: null,
  timeLeft: 60,
  isActive: false,
  teacherSocketId: null
};

// Helper functions
function calculateResults() {
  const totalAnswers = Array.from(gameState.results.values()).reduce((sum, count) => sum + count, 0);
  const resultsArray = [];
  
  if (gameState.currentPoll) {
    gameState.currentPoll.options.forEach((option, index) => {
      const count = gameState.results.get(index) || 0;
      const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
      resultsArray.push({
        option,
        count,
        percentage
      });
    });
  }
  
  return resultsArray;
}

function endPoll() {
  if (gameState.currentPoll) {
    // Save to history
    const finalResults = calculateResults();
    gameState.pollHistory.push({
      id: Date.now(),
      question: gameState.currentPoll.question,
      options: gameState.currentPoll.options,
      results: finalResults,
      timestamp: new Date(),
      totalParticipants: gameState.students.size
    });
    
    // Clear timer
    if (gameState.timer) {
      clearInterval(gameState.timer);
      gameState.timer = null;
    }
    
    // Reset poll state
    gameState.isActive = false;
    gameState.timeLeft = 60;
    
    // Reset student answered status
    gameState.students.forEach(student => {
      student.hasAnswered = false;
    });
    
    // Notify all clients
    io.emit('poll_ended', {
      results: finalResults,
      totalParticipants: gameState.students.size
    });
  }
}

function startTimer(duration) {
  gameState.timeLeft = duration;
  gameState.timer = setInterval(() => {
    gameState.timeLeft--;
    
    // Broadcast time update
    io.emit('timer_update', { timeLeft: gameState.timeLeft });
    
    if (gameState.timeLeft <= 0) {
      endPoll();
    }
  }, 1000);
}

// Socket event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Teacher joins
  socket.on('join_as_teacher', () => {
    gameState.teacherSocketId = socket.id;
    socket.join('teacher');
    
    // Send current state to teacher
    socket.emit('teacher_joined', {
      currentPoll: gameState.currentPoll,
      students: Array.from(gameState.students.values()),
      results: calculateResults(),
      isActive: gameState.isActive,
      timeLeft: gameState.timeLeft,
      pollHistory: gameState.pollHistory
    });
    
    console.log('Teacher joined');
  });

  // Student joins
  socket.on('join_as_student', (data) => {
    const { name } = data;
    
    if (!name || name.trim() === '') {
      socket.emit('error', { message: 'Name is required' });
      return;
    }

    // Check if name is already taken
    const nameExists = Array.from(gameState.students.values()).some(student => 
      student.name.toLowerCase() === name.toLowerCase()
    );
    
    if (nameExists) {
      socket.emit('error', { message: 'Name already taken' });
      return;
    }

    // Add student
    const studentId = socket.id;
    gameState.students.set(studentId, {
      id: studentId,
      name: name.trim(),
      socketId: socket.id,
      hasAnswered: false
    });

    socket.join('students');
    
    // Notify student of successful join
    socket.emit('student_joined', {
      currentPoll: gameState.currentPoll,
      isActive: gameState.isActive,
      timeLeft: gameState.timeLeft,
      hasAnswered: false
    });

    // Notify teacher about new student
    if (gameState.teacherSocketId) {
      io.to(gameState.teacherSocketId).emit('student_list_updated', {
        students: Array.from(gameState.students.values())
      });
    }

    console.log('Student joined:', name);
  });

  // Teacher creates a poll
  socket.on('create_poll', (data) => {
    if (socket.id !== gameState.teacherSocketId) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    const { question, options, timeLimit = 60 } = data;
    
    if (!question || !options || options.length < 2) {
      socket.emit('error', { message: 'Question and at least 2 options are required' });
      return;
    }

    // Check if can start new poll
    if (gameState.isActive) {
      socket.emit('error', { message: 'A poll is already active' });
      return;
    }

    // Create new poll
    gameState.currentPoll = {
      question: question.trim(),
      options: options.map(opt => opt.trim()),
      timeLimit,
      createdAt: new Date()
    };

    // Reset results
    gameState.results.clear();
    options.forEach((_, index) => {
      gameState.results.set(index, 0);
    });

    // Reset student answered status
    gameState.students.forEach(student => {
      student.hasAnswered = false;
    });

    gameState.isActive = true;

    // Start timer
    startTimer(timeLimit);

    // Notify all clients
    io.emit('poll_created', {
      poll: gameState.currentPoll,
      timeLeft: gameState.timeLeft
    });

    console.log('Poll created:', question);
  });

  // Student submits answer
  socket.on('submit_answer', (data) => {
    const { optionIndex } = data;
    const student = gameState.students.get(socket.id);

    if (!student) {
      socket.emit('error', { message: 'Student not found' });
      return;
    }

    if (!gameState.isActive || !gameState.currentPoll) {
      socket.emit('error', { message: 'No active poll' });
      return;
    }

    if (student.hasAnswered) {
      socket.emit('error', { message: 'Already answered' });
      return;
    }

    if (optionIndex < 0 || optionIndex >= gameState.currentPoll.options.length) {
      socket.emit('error', { message: 'Invalid option' });
      return;
    }

    // Record answer
    student.hasAnswered = true;
    const currentCount = gameState.results.get(optionIndex) || 0;
    gameState.results.set(optionIndex, currentCount + 1);

    // Notify student of successful submission
    socket.emit('answer_submitted', {
      optionIndex,
      results: calculateResults()
    });

    // Broadcast updated results
    const results = calculateResults();
    io.emit('results_updated', {
      results,
      totalParticipants: gameState.students.size,
      answered: Array.from(gameState.students.values()).filter(s => s.hasAnswered).length
    });

    // Check if all students have answered
    const allAnswered = Array.from(gameState.students.values()).every(s => s.hasAnswered);
    if (allAnswered && gameState.students.size > 0) {
      endPoll();
    }

    console.log('Answer submitted by:', student.name, 'Option:', optionIndex);
  });

  // Teacher removes student
  socket.on('remove_student', (data) => {
    if (socket.id !== gameState.teacherSocketId) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    const { studentId } = data;
    const student = gameState.students.get(studentId);
    
    if (student) {
      // Notify student they've been removed
      io.to(student.socketId).emit('kicked_out');
      
      // Remove from game state
      gameState.students.delete(studentId);
      
      // Update teacher's student list
      socket.emit('student_list_updated', {
        students: Array.from(gameState.students.values())
      });

      console.log('Student removed:', student.name);
    }
  });

  // Get poll history
  socket.on('get_poll_history', () => {
    if (socket.id !== gameState.teacherSocketId) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    socket.emit('poll_history', {
      history: gameState.pollHistory
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove student if exists
    const student = gameState.students.get(socket.id);
    if (student) {
      gameState.students.delete(socket.id);
      
      // Notify teacher
      if (gameState.teacherSocketId) {
        io.to(gameState.teacherSocketId).emit('student_list_updated', {
          students: Array.from(gameState.students.values())
        });
      }
      
      console.log('Student disconnected:', student.name);
    }
    
    // Handle teacher disconnect
    if (socket.id === gameState.teacherSocketId) {
      gameState.teacherSocketId = null;
      console.log('Teacher disconnected');
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});