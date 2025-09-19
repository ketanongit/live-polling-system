export const SOCKET_EVENTS = {
  // Client to Server
  JOIN_AS_TEACHER: 'join_as_teacher',
  JOIN_AS_STUDENT: 'join_as_student',
  CREATE_POLL: 'create_poll',
  SUBMIT_ANSWER: 'submit_answer',
  REMOVE_STUDENT: 'remove_student',
  GET_POLL_HISTORY: 'get_poll_history',
  CLEAR_POLL: 'clear_poll',

  // Server to Client
  TEACHER_JOINED: 'teacher_joined',
  STUDENT_JOINED: 'student_joined',
  POLL_CREATED: 'poll_created',
  POLL_ENDED: 'poll_ended',
  POLL_CLEARED: 'poll_cleared',
  ANSWER_SUBMITTED: 'answer_submitted',
  RESULTS_UPDATED: 'results_updated',
  STUDENT_LIST_UPDATED: 'student_list_updated',
  TIMER_UPDATE: 'timer_update',
  KICKED_OUT: 'kicked_out',
  ERROR: 'error',
  POLL_HISTORY: 'poll_history'
};

export const USER_ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student'
};

export const POLL_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  ENDED: 'ended'
};
