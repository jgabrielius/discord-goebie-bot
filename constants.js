module.exports = {
  ROLES: ['Young Goebie', 'Goebie Caretaker', 'Goebie Fetcher', 'Goebie Ranger', 'Ancient Apprentice', 'Ancient Goebie'],
  HOST_ROLE: 'Goebie Guide',
  SIGN_UP_CHANNEL: 'gt-sign-up',
  TEAM_LIST_CHANNEL: 'gt-team-list',
  HOSTS_CHANNEL: 'gt-hosts',
  MAX_DAYS_IN_ADVANCE:  5,
  SIGN_UP_DATE_FORMAT: 'D/M/YYYY',
  BAD_REMOVE_ERROR: 'Hello, your request to remove a person has been rejected. Person not found in the list',
  BAD_HOST_ERROR: 'Hello, your request to host has been rejected. Invalid date',
  BAD_HOST_TOO_EARLY_ERROR: 'Hello, your request to host has been rejected. You can only sign up 5 days in advance',
  BAD_SIGNUP_ALREADY_SIGNED: 'Hello, your sign up has been rejected. You have already registered for this date',
  BAD_SIGNUP_NO_ROLE_ERROR: 'Hello, your sign up has been rejected. Assign yourself a role in self-assign channel',
  BAD_SIGNUP_DATE_ERROR: 'Hello, your sign up has been rejected. Invalid date',
  BAD_SIGNUP_TOO_EARLY_ERROR: 'Hello, your sign up has been rejected. You can only sign up 5 days in advance',
  BAD_SIGNUP_ERROR: `Hello, your sign up has been rejected. Please use the correct sign up format:

Sign-up date: <DD/MM/YYYY>
RSN: <Username>
Role Request: <Request, N/A if you don't mind>

Example:

Sign-up date: 20/12/2018
RSN: Luckyluke91
Role Request: Poison Tank`,
  ERRORS: {
    SIGN_UP: {
      PAST_DATE: 'Hello, your request has been rejected. Reason: sign up date cannot be in the past.',
      INVALID_DATE: 'Hello, your request has been rejected. Reason: sign up date invalid.',
      EARLY_DATE: 'Hello, your request has been rejected. Reason: you can only sign up 5 days in advance.',
      NO_ROLE: 'Hello, your request has been rejected. Reason: you have no role assigned.',
      INVALID_FORMAT: `Hello, your sign up has been rejected. Reason: invalid format. Please use the correct sign up format:

Sign-up date: <DD/MM/YYYY>
RSN: <Username>
Role Request: <Request, N/A if you don't mind>

Example:

Sign-up date: 20/12/2018
RSN: Luckyluke91
Role Request: Poison Tank`
    }
  }
}