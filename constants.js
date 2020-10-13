module.exports = {
  ROLES: ['Young Goebie', 'Goebie Caretaker', 'Goebie Fetcher', 'Goebie Ranger', 'Ancient Apprentice', 'Ancient Goebie'],
  HOST_ROLE: 'Goebie Guide',
  SIGN_UP_CHANNEL: '18gt-sign-up',
  TEAM_LIST_CHANNEL: '18gt-team-list',
  MAX_DAYS_IN_ADVANCE:  5,
  SIGN_UP_DATE_FORMAT: 'D/M/YYYY',
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
Role Request: Poison Tank`
}