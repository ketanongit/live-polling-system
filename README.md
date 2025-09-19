# Real-Time Polling Application

This is a real-time polling application that allows teachers to create polls and students to answer them. Both teachers and students can view the poll results in real-time.

## Teacher Features

*   **Create a new poll:** Teachers can create new polls with a question and multiple options.
*   **View live polling results:** Teachers can see the results of the poll in real-time as students submit their answers.
*   **Ask a new question:** Teachers can ask a new question only if:
    *   No question has been asked yet, or
    *   The previous poll has ended (either by the timer running out or by the teacher's action).
*   **Configurable poll time limit:** Teachers can set a time limit for each poll.
*   **Remove a student:** Teachers have the option to remove a student from the session.
*   **View past poll results:** Teachers can view the results of past polls.

## Student Features

*   **Enter name on first visit:** Students are prompted to enter their name when they first join a session. The name must be unique.
*   **Submit answers:** Students can submit their answers to a poll once a question is asked.
*   **View live polling results:** Students can see the live polling results after they have submitted their answer.
*   **Time limit:** Students have a maximum of 60 seconds (or the time set by the teacher) to answer a question, after which the results are shown.

## Technology Stack

*   **Frontend:** React, Redux, Tailwind CSS
*   **Backend:** Express.js, Socket.io

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18.0.0 or higher)
*   npm

### Installation & Running

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your_username/your_project_name.git
    ```
2.  **Install server dependencies**
    ```sh
    cd server
    npm install
    ```
3.  **Install client dependencies**
    ```sh
    cd ../client
    npm install
    ```
4.  **Create a `.env` file in the `server` directory**
    ```
    CORS_ORIGIN=http://localhost:5173
    PORT=5001
    ```
    *Note: The default client port is 5173 (Vite), but you can change it in `client/vite.config.js`.*
5.  **Start the server**
    In the `server` directory, run:
    ```sh
    npm start
    ```
    The server will start on port 5001 (or the port you specified in your `.env` file).
6.  **Start the client**
    In a new terminal, navigate to the `client` directory and run:
    ```sh
    npm run dev
    ```
    The client will be available at `http://localhost:5173`.
