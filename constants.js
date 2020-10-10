module.exports = {
  ROLES: ['Young Goebie', 'Goebie Caretaker', 'Goebie Fetcher', 'Goebie Ranger', 'Ancient Goebie'],
  SIGN_UP_CHANNEL: '18gt-sign-up',
  TEAM_LIST_CHANNEL: '18gt-team-list',
  MAX_DAYS_IN_ADVANCE:  2,
  SIGN_UP_DATE_FORMAT: 'D/M/YYYY',
  BAD_SIGNUP_NO_ROLE_ERROR: 'Hello, your sign up has been rejected. Assign yourself a role in self-assign channel',
  BAD_SIGNUP_DATE_ERROR: 'Hello, your sign up has been rejected. Invalid date',
  BAD_SIGNUP_TOO_EARLY_ERROR: 'Hello, your sign up has been rejected. You can only sign up 2 days in advance',
  BAD_SIGNUP_ERROR: `Hello, your sign up has been rejected. Please use the correct sign up format:

Sign-up date: <DD/MM/YYYY>
RSN: <Username>
Role Request: <Request, N/A if you don't mind>

Example:

Sign-up date: 20/12/2018
RSN: Luckyluke91
Role Request: Poison Tank`,
  TEAM_LIST_TEMPLATE: requestDate => {
    return `Raid team 1, 18.00 GT ${requestDate}

HOST: <@&763481634757410876>
#2: Spot reserved for Ancient Goebie or higher
#3: Spot reserved for Ancient Goebie or higher
#4: Spot reserved for Goebie Ranger or higher
#5: Spot reserved for Goebie Ranger or higher
#6: Spot reserved for Goebie Fetcher or higher
#7: Spot reserved for Goebie Fetcher or higher
#8: Spot reserved for Goebie Caretaker or higher
#9: Spot reserved for Young Goebie or higher
#10: Spot reserved for Young Goebie or higher

Backup:`
  }
}