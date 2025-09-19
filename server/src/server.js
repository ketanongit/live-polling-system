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
  students: new Map(), // studentId -> { name, socketId, hasAnswered, selectedOption }
  results: new Map(), // optionIndex -> count
  pollHistory: [],
  timer: null,
  timeLeft: 60,
  isActive: false,
  teacherSocketId: null,
  pollStartTime: null
};

// Helper functions
function calculateResults(includeCorrectAnswers = false) {
  const totalAnswers = Array.from(gameState.results.values()).reduce((sum, count) => sum + count, 0);
  const resultsArray = [];
  
  if (gameState.currentPoll) {
    gameState.currentPoll.options.forEach((option, index) => {
      const count = gameState.results.get(index) || 0;
      const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
      
      const result = {
        option,
        count,
        percentage
      };
      
      // Only include correct answer information if explicitly requested (when poll ends)
      if (includeCorrectAnswers) {
        result.isCorrect = gameState.currentPoll.correctAnswers && 
                          gameState.currentPoll.correctAnswers[index] === true;
      }
      
      resultsArray.push(result);
    });
  }
  
  return resultsArray;
}

function broadcastStudentUpdate() {
  if (gameState.teacherSocketId) {
    io.to(gameState.teacherSocketId).emit('student_list_updated', {
      students: Array.from(gameState.students.values())
    });
  }
}

function broadcastResults() {
  const results = calculateResults();
  const answeredCount = Array.from(gameState.students.values()).filter(s => s.hasAnswered).length;
  
  io.emit('results_updated', {
    results,
    totalParticipants: gameState.students.size,
    answered: answeredCount
  });
}

function endPoll() {
  if (gameState.currentPoll) {
    console.log('Ending poll:', gameState.currentPoll.question);
    
    // Save to history with correct answers revealed
    const finalResults = calculateResults(true); // Include correct answers
    gameState.pollHistory.unshift({
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
    
    // Reset poll state but keep the poll for results viewing
    gameState.isActive = false;
    gameState.timeLeft = 0;
    gameState.pollStartTime = null;
    
    // Reset student answered status for next poll
    gameState.students.forEach(student => {
      student.hasAnswered = false;
      student.selectedOption = null;
    });
    
    // Notify all clients with correct answers revealed
    io.emit('poll_ended', {
      results: finalResults,
      totalParticipants: gameState.students.size
    });
    
    // Update teacher with latest student list
    broadcastStudentUpdate();
    
    console.log('Poll ended successfully');
  }
}

function startTimer(duration) {
  // Clear existing timer
  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }
  
  gameState.timeLeft = duration;
  gameState.pollStartTime = Date.now();
  gameState.isActive = true;
  
  console.log('Starting timer for', duration, 'seconds');
  
  gameState.timer = setInterval(() => {
    gameState.timeLeft--;
    
    // Broadcast time update to all clients
    io.emit('timer_update', { timeLeft: gameState.timeLeft });
    
    console.log('Timer update:', gameState.timeLeft);
    
    if (gameState.timeLeft <= 0) {
      console.log('Timer expired, ending poll');
      endPoll();
    }
  }, 1000);
}

function canCreateNewPoll() {
  // Can create if no current poll
  if (!gameState.currentPoll) {
    return true;
  }
  
  // Can create if poll is not active (ended)
  if (!gameState.isActive) {
    return true;
  }
  
  // Can create if all students have answered (but poll is still active)
  const allStudentsAnswered = gameState.students.size > 0 && 
    Array.from(gameState.students.values()).every(s => s.hasAnswered);
  
  return allStudentsAnswered;
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
      hasAnswered: false,
      selectedOption: null
    });

    socket.join('students');
    
    // Send current poll state to student (including active polls)
    const currentResults = calculateResults();
    const studentData = {
      currentPoll: gameState.currentPoll,
      isActive: gameState.isActive,
      timeLeft: gameState.timeLeft,
      hasAnswered: false,
      results: currentResults, // Always send current results
      totalParticipants: gameState.students.size
    };
    
    console.log('Sending student data:', {
      hasCurrentPoll: !!gameState.currentPoll,
      isActive: gameState.isActive,
      resultsCount: currentResults.length,
      totalParticipants: gameState.students.size
    });
    
    socket.emit('student_joined', studentData);

    // Notify teacher about new student
    broadcastStudentUpdate();
    
    // If there's an active poll, also send current results to teacher
    if (gameState.isActive) {
      broadcastResults();
    }

    console.log('Student joined:', name, 'Active poll:', !!gameState.currentPoll, 'IsActive:', gameState.isActive);
  });

  // Teacher clears current poll
  socket.on('clear_poll', () => {
    if (socket.id !== gameState.teacherSocketId) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    console.log('Teacher requested to clear poll');
    
    // Clear current poll
    gameState.currentPoll = null;
    gameState.isActive = false;
    gameState.timeLeft = 0;
    gameState.results.clear();
    
    // Clear timer
    if (gameState.timer) {
      clearInterval(gameState.timer);
      gameState.timer = null;
    }
    
    // Reset student answered status
    gameState.students.forEach(student => {
      student.hasAnswered = false;
      student.selectedOption = null;
    });
    
    // Notify all clients that poll is cleared
    io.emit('poll_cleared');
    
    console.log('Poll cleared successfully');
  });

  // Teacher creates a poll
  socket.on('create_poll', (data) => {
    if (socket.id !== gameState.teacherSocketId) {
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    const { question, options, correctAnswers, timeLimit = 60 } = data;
    
    if (!question || !options || options.length < 2) {
      socket.emit('error', { message: 'Question and at least 2 options are required' });
      return;
    }

    // Check if can start new poll
    const canCreate = canCreateNewPoll();
    console.log('Can create new poll:', canCreate, {
      hasCurrentPoll: !!gameState.currentPoll,
      isActive: gameState.isActive,
      studentsCount: gameState.students.size
    });
    
    if (!canCreate) {
      socket.emit('error', { message: 'Cannot create new poll until all students answer current poll' });
      return;
    }

    console.log('Creating new poll:', question);

    // Clear any existing timer
    if (gameState.timer) {
      clearInterval(gameState.timer);
      gameState.timer = null;
    }

    // Create new poll
    gameState.currentPoll = {
      question: question.trim(),
      options: options.map(opt => opt.trim()),
      correctAnswers: correctAnswers || options.map(() => false),
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
      student.selectedOption = null;
    });

    // Start timer and set active
    startTimer(timeLimit);

    // Notify all clients
    io.emit('poll_created', {
      poll: gameState.currentPoll,
      timeLeft: gameState.timeLeft
    });

    // Send initial results (all zeros) to everyone
    broadcastResults();

    // Update teacher with student list
    broadcastStudentUpdate();

    console.log('Poll created successfully:', question);
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
    student.selectedOption = optionIndex;
    const currentCount = gameState.results.get(optionIndex) || 0;
    gameState.results.set(optionIndex, currentCount + 1);

    // Check if answer is correct
    const isCorrect = gameState.currentPoll.correctAnswers && 
                     gameState.currentPoll.correctAnswers[optionIndex] === true;

    // Notify student of successful submission
    socket.emit('answer_submitted', {
      optionIndex,
      isCorrect,
      results: calculateResults()
    });

    // Broadcast updated results to everyone
    broadcastResults();
    
    // Update teacher's student list
    broadcastStudentUpdate();

    // Don't end poll when all students answer - let timer run its course
    const allAnswered = Array.from(gameState.students.values()).every(s => s.hasAnswered);
    if (allAnswered && gameState.students.size > 0) {
      console.log('All students answered, but poll continues until timer expires');
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
      console.log('Removing student:', student.name);
      
      // Notify student they've been removed
      io.to(student.socketId).emit('kicked_out');
      
      // Remove from game state
      gameState.students.delete(studentId);
      
      // Update teacher's student list
      broadcastStudentUpdate();
      
      // Update results if poll is active
      if (gameState.isActive) {
        broadcastResults();
      }
      
      // Don't end poll when all remaining students have answered - let timer run its course
      if (gameState.isActive && gameState.students.size > 0) {
        const allAnswered = Array.from(gameState.students.values()).every(s => s.hasAnswered);
        if (allAnswered) {
          console.log('All remaining students answered after removal, but poll continues until timer expires');
        }
      }

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
      broadcastStudentUpdate();
      
      // Update results if poll is active
      if (gameState.isActive) {
        broadcastResults();
        
        // Don't end poll when all remaining students have answered - let timer run its course
        if (gameState.students.size > 0) {
          const allAnswered = Array.from(gameState.students.values()).every(s => s.hasAnswered);
          if (allAnswered) {
            console.log('All remaining students answered after disconnect, but poll continues until timer expires');
          }
        }
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
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    gameState: {
      hasCurrentPoll: !!gameState.currentPoll,
      isActive: gameState.isActive,
      studentsCount: gameState.students.size,
      timeLeft: gameState.timeLeft
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (gameState.timer) {
    clearInterval(gameState.timer);
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});