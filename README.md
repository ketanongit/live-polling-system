# Real-Time Polling Application

This is a real-time polling application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. It allows teachers to create polls and students to answer them in real-time. Both teachers and students can see the results of the polls as they come in.

## Teacher Features

- **Create a new poll:** Teachers can create new polls with a question and multiple-choice answers.
- **View live polling results:** Teachers can see the results of the poll in real-time as students submit their answers.
- **Ask a new question:** Teachers can ask a new question only if:
    - No question has been asked yet, or
    - All students have answered the previous question.
- **Configurable poll time limit:** Teachers can set a time limit for each poll.
- **Remove a student:** Teachers have the option to remove a student from the poll.
- **View past poll results:** Teachers can view the results of past polls.

## Student Features

- **Enter name on first visit:** Students are required to enter a unique name when they first join the poll. This name is unique to each tab.
- **Submit answers:** Students can submit their answers to the poll questions once a question is asked.
- **View live polling results after submission:** After submitting their answer, students can see the live results of the poll.
- **Maximum of 60 seconds to answer a question:** Students have a maximum of 60 seconds to answer each question, after which the results are shown.

## Technology Stack

- **Frontend:** React, Redux
- **Backend:** Express.js, Socket.io

## How to Run

To run this project, you will need to run the client and server separately.

### Prerequisites

- Node.js (v18 or higher)
- npm

### Server

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
The server will be running on `http://localhost:5001`.

### Client

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the client:
   ```bash
   npm run dev
   ```
The client will be running on `http://localhost:3000`.
