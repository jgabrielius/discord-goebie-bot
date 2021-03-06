const constants = require('./constants');
const { validateDate, findTeamListMessage, reactSuccess, findHighestRoleIndex } = require('./helpers');
const { handlePromiseErrors, SignupError, UserError, RemoveError } = require('./errors');
const { removePersonFromTeam } = require('./remove');

const removeCommandRegex = /^!remove \s*(.*)$/;

const isSignup = msg => {
  return new RegExp(`^(\\d\\d)${constants.SIGN_UP_CHANNEL}$`).test(msg.channel.name);
}

const parseSignupRequest = msg => {
  let messageParts = msg.content.split('\n'), request = {};
  if (![2, 3].includes(messageParts.length)) {
    throw new SignupError(constants.ERRORS.SIGN_UP.INVALID_FORMAT);
  }

  let date = messageParts[0].match(/^(?:Date: |Sign-up date: ?)?(.*?)\s*$/)
  if (date === null) {
    throw new SignupError(constants.ERRORS.SIGN_UP.INVALID_FORMAT);
  }
  try {
    request.date = validateDate(date[1]);
  } catch (err) {
    if (err instanceof UserError) {
      throw new SignupError(err);
    }
  }

  let rsn = messageParts[1].match(/^(?:RSN:\s*)?(.*?)\s*$/)
  if (rsn === null) {
    throw new SignupError(constants.ERRORS.SIGN_UP.INVALID_FORMAT);
  }
  request.rsn = rsn[1];

  if (messageParts.length === 2) {
    request.role = '';
    return request;
  }

  let role = messageParts[2].match(/^(?:Role Request: ?)?(.*)$/)
  if (role === null) {
    request.role = '';
    return request;
  }
  request.role = role[1];
  return request;
}

const isUserAlreadyRegistered = (message, user) => {
  return message.content.includes(user) && process.env.ALLOW_MULTIPLE_SIGNUPS !== 'true';
}

const findHighestRoleForUser = (message, user) => {
  let highestRoleIndex = findHighestRoleIndex(user);
  if (highestRoleIndex === -1) {
    throw new SignupError(constants.ERRORS.SIGN_UP.NO_ROLE);
  }
  let freeRoles = message.content.match(/(?<=Spot reserved for ).*?(?= or higher)/g) || [];
  return freeRoles.find(name => {
    let roleIndex = constants.ROLES.findIndex(val => {return name === val});
    if (roleIndex <= highestRoleIndex) {
      return name;
    }
  });
}

const processSignUpCommand = msg => {
  if (isCommandRemove(msg)) {
    processCommandRemove(msg);
  } else {
    processCommandSignUp(msg);
  }
}

const processCommandSignUp = msg => {
  let request = parseSignupRequest(msg);
  handlePromiseErrors(reactSuccess(findTeamListMessage(msg, request.date).then(message => {
    if (isUserAlreadyRegistered(message, msg.author)) {
      throw new SignupError(constants.ERRORS.SIGN_UP.ALREADY_SIGNED);
    }
    
    let content = message.content;
    let filledRole = findHighestRoleForUser(message, msg.member);
    let requestMessage;
    let compareTo = msg.member.nickname ? msg.member.nickname : msg.author.username;
    if (compareTo.toUpperCase() !== request.rsn.toUpperCase()) {
      requestMessage = `${msg.author} (RSN: ${request.rsn}) ${request.role}`;
    } else {
      requestMessage = `${msg.author} ${request.role}`;
    }
    //Add to backup
    if (!filledRole) {
      return message.edit(content + `\n${requestMessage}`).then(() => {
        return msg.react("🅱️")
      });
    }
    // Replace filled role with user
    let regexp = new RegExp(`Spot reserved for ${filledRole} or higher`);
    return message.edit(content.replace(regexp, requestMessage));
  }), msg), msg);
}

const isCommandRemove = msg => {
  return removeCommandRegex.test(msg.content);
}

const processCommandRemove = msg => {
  let request = parseRemoveCommand(msg);
  removePersonFromTeam(msg, request.date, request.user);
}

const parseRemoveCommand = msg => {
  let match = msg.content.match(removeCommandRegex);
  let date;
  try {
    date = validateDate(match[1]);
  } catch (err) {
    if (err instanceof UserError) {
      throw new RemoveError(err);
    }
  }

  return {
    date: date,
    user: msg.author.toString()
  };
}

module.exports = {
  isSignup,
  processSignUpCommand
}