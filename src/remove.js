const constants = require('./constants');
const { UserError, handlePromiseErrors } = require('./errors');
const { isHost, findTeamListMessage, getHostRoleFromChannel, reactSuccess, escapeRegExp, findHighestRoleIndex } = require('./helpers');

const isUserInTeamList = (message, user) => {
  return message.content.includes(user) && !isHost(message, user);
}

const isUserInBackup = (message, user) => {
  return new RegExp(`^${user}.*$`, 'm').test(message.content);
}

const getUserById = (channel, id) => {
  return channel.guild.members.cache.get(id);
}

const getUserTextAndSlot = (content, user, slot) => {
  let cleanUser = user.toString().replace('!', '');
  let match = content.match(new RegExp(`^#(${slot ? slot : '\\d\\d?'}): (${cleanUser}.*)$`, 'm'));

  return {
    slot: match[1],
    text: match[2]
  }
}

const getRoleTextAndIndex = slot => {
  let text, index;
  switch (slot.toString()) {
    case '2':
    case '3':
      text = 'Spot reserved for Ancient Goebie or higher';
      index = 5;
      break;
    case '4':
    case '5':
      text = 'Spot reserved for Goebie Ranger or higher';
      index = 3;
      break
    case '6':
    case '7':
      text = 'Spot reserved for Goebie Fetcher or higher';
      index = 2;
      break;
    case '8':
      text = 'Spot reserved for Goebie Caretaker or higher';
      index = 1;
      break;
    case '9':
    case '10':
      text = 'Spot reserved for Young Goebie or higher';
      index = 0;
      break
    default:
      throw new Error("Invalid slot number for searching role");
  }
  return {
    index: index,
    text: text
  }
}

const getUserAccountAtSlot = (channel, content, slot) => {
  let match = content.match(new RegExp(`(?<=#${slot}: <@).*(?=>)`))
  if (match) {
    return getUserById(channel, match[0]);
  }
}

const getBackupList = message => {
  let match = message.content.match(new RegExp(/(?<=Backup:\n).*$/, 'sm'));
  if (match) {
    return match[0].split('\n');
  } else {
    return [];
  }
}

const getFilledContent = (message, content, emptySlot) => {
  //Look who can fill empty slot starting from one below removed slot moving down
  let emptyRoleInfo = getRoleTextAndIndex(emptySlot);
  for (let i = parseInt(emptySlot) + 1; i <= 10; i++) {
    let user = getUserAccountAtSlot(message.channel, content, i);
    if (user) {
      let roleInfo = getRoleTextAndIndex(i);
      let highestUserRoleIndex = findHighestRoleIndex(user);
      if (highestUserRoleIndex >= emptyRoleInfo.index && highestUserRoleIndex !== roleInfo.index && roleInfo.index !== emptyRoleInfo.index) {
        let userInfo = getUserTextAndSlot(content, user, i);
        content = content.replace(userInfo.text, roleInfo.text);
        content = content.replace(new RegExp(`(?<=^#${emptySlot}: ).*$`, 'm'), userInfo.text);
        emptySlot = userInfo.slot;
        emptyRoleInfo = getRoleTextAndIndex(emptySlot);
      }
    }
  }
  //Look who can fill from backup
  let filler = getBackupList(message).find(member => {
    let memberTag = member.match(/(?<=<@).*(?=>)/);
    let user = getUserById(message.channel, memberTag[0]);
    return findHighestRoleIndex(user) >= emptyRoleInfo.index;
  });

  if (filler) {
    let fillerText = content.match(new RegExp(`^${escapeRegExp(filler)}.*$`, 'm'))
    content = content.replace('\n' + fillerText, '').replace(emptyRoleInfo.text, fillerText);
  }

  return content;
}

const removePersonFromTeam = (msg, date, user) => {
  handlePromiseErrors(reactSuccess(findTeamListMessage(msg, date).then(message => {
    if (!isUserInTeamList(message, user)) {
      throw new UserError(constants.ERRORS.HOST.USER_NOT_FOUND);
    }

    if (isUserInBackup(message, user)) {
      return message.edit(message.content.replace(new RegExp(`\n${escapeRegExp(user)}.*$`, 'm'), ''));
    } else {
      let userInfo = getUserTextAndSlot(message.content, user);
      let roleInfo = getRoleTextAndIndex(userInfo.slot);
      //First remove the user
      let content = message.content.replace(userInfo.text, roleInfo.text);
      //Fill empty slots
      content = getFilledContent(message, content, userInfo.slot);

      return message.edit(content);
    }

  }), msg), msg);
}

module.exports = {
  removePersonFromTeam
}