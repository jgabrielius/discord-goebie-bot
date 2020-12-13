const constants = require('./constants');
const { validateDate, findTeamListMessage, reactSuccess, findHighestRoleIndex } = require('./helpers');
const { UserError, handlePromiseErrors } = require('./errors');


const isSignup = msg => {
  return new RegExp(`^(\\d\\d)${constants.SIGN_UP_CHANNEL}$`).test(msg.channel.name);
}

const parseSignupRequest = msg => {
  let messageParts = msg.content.split('\n'), request = {};
  if (![2,3].includes(messageParts.length)) {
    throw new UserError(constants.ERRORS.SIGN_UP.INVALID_FORMAT);
  }

  let date = messageParts[0].match(/^(?:Date: |Sign-up date: ?)?(.*?)\s*$/)
  if (date === null) {
    throw new UserError(constants.ERRORS.SIGN_UP.INVALID_FORMAT);
  }
  request.date = validateDate(date[1]);

  let rsn = messageParts[1].match(/^(?:RSN: ?)?(.*)$/)
  if (rsn === null) {
    throw new UserError(constants.ERRORS.SIGN_UP.INVALID_FORMAT);
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
    throw new UserError(constants.ERRORS.SIGN_UP.NO_ROLE);
  }
  let freeRoles = message.content.match(/(?<=Spot reserved for ).*?(?= or higher)/g) || [];
  return freeRoles.find(name => {
    let roleIndex = constants.ROLES.findIndex(val => {return name === val});
    if (roleIndex <= highestRoleIndex) {
      return name;
    }
  });
}

const proccessSignUpCommand = msg => {
  let request = parseSignupRequest(msg);
  handlePromiseErrors(reactSuccess(findTeamListMessage(msg, request.date).then(message => {
    if (message.author != msg.client.user) {
      return;
    }
    if (isUserAlreadyRegistered(message, msg.author)) {
      throw new UserError(constants.ERRORS.SIGN_UP.ALREADY_SIGNED);
    }
    
    let content = message.content;
    let filledRole = findHighestRoleForUser(message, msg.member);
    //Add to backup
    if (!filledRole) {
      return message.edit(content + `\n${msg.author} ${request.role}`).then(() => {
        return msg.react("🅱️")
      });
    }
    // Replace filled role with user
    let regexp = new RegExp(`Spot reserved for ${filledRole} or higher`);
    return message.edit(content.replace(regexp, `${msg.author} ${request.role}`));
  }), msg), msg);
}

module.exports = {
  isSignup,
  proccessSignUpCommand
}