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
    DATE: {
      PAST: 'date cannot be in the past.',
      EARLY: 'date cannot be later than 5 days in advance',
      INVALID: 'date invalid.',
    },
    SIGN_UP: {
      NO_ROLE: 'no role assigned. Please asign yourself a role in <#585510907678031907>',
      ALREADY_SIGNED: 'you have already signed up for this date.',
      INVALID_FORMAT: 'invalid format.'
    },
    HOST: {
      NO_HOSTS: 'team list does not have a host to remove.',
      USER_NOT_FOUND: 'user not found in list.',
      NOT_EMPTY: 'host spot already taken for that day.',
      OTHER_HOST: 'you cannot remove other hosts.'
    },
    CANNOT_EDIT: 'cannot edit team list since it was not posted by bot.',
    UNKNOWN: 'unknown. Please contact the bot owner <@159663440011460609>.'
  }
}