module.exports = {
  ROLES: ['Young Goebie', 'Goebie Caretaker', 'Goebie Fetcher', 'Goebie Ranger', 'Ancient Apprentice', 'Ancient Goebie'],
  HOST_ROLE: 'Goebie Guide',
  SIGN_UP_CHANNEL: 'gt-sign-up',
  TEAM_LIST_CHANNEL: 'gt-team-list',
  HOSTS_CHANNEL: 'gt-hosts',
  MAX_DAYS_IN_ADVANCE:  5,
  RETRY_LIMIT: 20,
  SIGN_UP_DATE_FORMAT: 'D/M/YYYY',
  ERRORS: {
    SIGN_UP: {
      PAST_DATE: 'Hello, your request has been rejected. Reason: sign up date cannot be in the past.',
      INVALID_DATE: 'Hello, your request has been rejected. Reason: sign up date invalid.',
      EARLY_DATE: 'Hello, your request has been rejected. Reason: you can only sign up 5 days in advance.',
      NO_ROLE: 'Hello, your request has been rejected. Reason: you have no role assigned.',
      ALREADY_SIGNED: 'Hello, your request has been rejected. Reason: you have already registered for this date.',
      INVALID_FORMAT: `Hello, your sign up has been rejected. Reason: invalid format. Please use the correct sign up format:

Sign-up date: <DD/MM/YYYY>
RSN: <Username>
Role Request: <Request, N/A if you don't mind>

Example:

Sign-up date: 20/12/2018
RSN: Luckyluke91
Role Request: Poison Tank`
    },
    HOST: {
      USER_NOT_FOUND: 'Hello, your request has been rejected. Reason: user not found.',
      NOT_EMPTY: 'Hello, your request has been rejected. Reason: host spot already taken for that day.',
      OTHER_HOST: 'Hello, your request has been rejected. Reason: you cannot remove other hosts.'
    },
    UNKNOWN: 'Hello, your request has been rejected. Reason: unknown. please contact the bot owner'
  }
}