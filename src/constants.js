module.exports = {
  ROLES: ['Young Goebie', 'Goebie Caretaker', 'Goebie Fetcher', 'Goebie Ranger', 'Ancient Apprentice', 'Ancient Goebie'],
  HOST_ROLE: 'Goebie Guide',
  SIGN_UP_CHANNEL: 'gt-sign-up',
  TEAM_LIST_CHANNEL: 'gt-team-list',
  HOSTS_CHANNEL: 'gt-hosts',
  MAX_DAYS_IN_ADVANCE:  5,
  RETRY_LIMIT: 5,
  SIGN_UP_DATE_FORMAT: 'D/M/YYYY',
  INPUT_DATE_FORMAT: 'D/M/YYYY',
  TEAM_LIST_DATE_FORMAT: 'DD/MM/YYYY',
  ERRORS: {
    SIGN_UP: {
      PAST_DATE: 'Sign-up date cannot be in the past.',
      INVALID_DATE: 'Sign-up date invalid.',
      EARLY_DATE: 'You can only sign up 5 days in advance.',
      NO_ROLE: 'No role assigned. Please asign yourself a role in <#585510907678031907>',
      ALREADY_SIGNED: 'You have already signed up for this date.',
      INVALID_FORMAT: 'Invalid format.'
    },
    HOST: {
      CANNOT_EDIT: 'Hello, your request has been rejected. Reason: cannot edit team list since it was not posted by bot.',
      NO_HOSTS: 'Hello, your request has been rejected. Reason: team list does not have a host to remove.',
      USER_NOT_FOUND: 'Hello, your request has been rejected. Reason: user not found.',
      NOT_EMPTY: 'Hello, your request has been rejected. Reason: host spot already taken for that day.',
      OTHER_HOST: 'Hello, your request has been rejected. Reason: you cannot remove other hosts.'
    },
    UNKNOWN: 'Hello, your request has been rejected. Reason: Unknown. Please contact the bot owner <@159663440011460609>.'
  }
}