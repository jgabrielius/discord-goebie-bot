const constants = require('./constants');
const { validateDate, findTeamListMessage, getHostRoleFromChannel, reactSuccess, escapeRegExp, findHighestRoleIndex } = require('./helpers');
const Discord = require("discord.js");
var moment = require('moment');
const { UserError, handlePromiseErrors } = require('./errors');

const hostCommandRegex = /^!host \s*(.*)$/;
const removeHostCommandRegex = /^!removehost \s*(.*)$/;
const removeCommandRegex = /^!remove \s*(<.*>) \s*(.*)$/;

const isHostCommand = msg => {
  return new RegExp(`^(\\d\\d)${constants.HOSTS_CHANNEL}$`).test(msg.channel.name);
}

const getHostsChannel = msg => {
  return msg.channel;
}

const isCommandHelp = msg => {
  return new RegExp(/^!help$/).test(msg.content);
}

const isCommandHost = msg => {
  return hostCommandRegex.test(msg.content);
}

const isCommandRemoveHost = msg => {
  return removeHostCommandRegex.test(msg.content);
}

const isCommandRemove = msg => {
  return removeCommandRegex.test(msg.content);
}

const getHostDate = msg => {
  return validateDate(msg.content.match(hostCommandRegex)[1]);
}

const isHostEmpty = message => {
  let hostRole = getHostRoleFromChannel(message.channel);
  return isHost(message, hostRole);
}

const isHost = (message, host) => {
  return new RegExp(`^HOST: ${host}$`, 'm').test(message.content);
}

const getRemoveHostDate = msg => {
  return validateDate(msg.content.match(removeHostCommandRegex)[1]);
}

const parseRemoveCommand = msg => {
  let match = msg.content.match(removeCommandRegex);
  return {
    date: validateDate(match[2]),
    user: match[1].replace('!', '')
  };
}

const isUserInTeamList = (message, user) => {
  return message.content.includes(user) && !isHost(message, user);
}

const isUserInBackup = (message, user) => {
  return new RegExp(`^${user}.*$`, 'm').test(message.content);
}

const getBackupList = message => {
  let match = message.content.match(new RegExp(/(?<=Backup:\n).*$/, 'sm'));
  if (match) {
    return match[0].split('\n');
  } else {
    return [];
  }
}

const getUserTextAndSlot = (content, user, slot) => {
  let match = content.match(new RegExp(`^#(${slot ? slot : '\\d\\d?'}): (${user}.*)$`, 'm'));
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

const getUserById = (channel, id) => {
  return channel.guild.members.cache.get(id);
}

const getUserAccountAtSlot = (message, slot) => {
  let match = message.content.match(new RegExp(`(?<=#${slot}: <@).*(?=>)`))
  if (match) {
    return getUserById(message.channel, match[0]);
  }
}

const getFilledContent = (message, content, emptySlot) => {
  //Look who can fill empty slot starting from top moving down
  let emptyRoleInfo = getRoleTextAndIndex(emptySlot);
  for (let i = 2; i <= 10; i++) {
    let user = getUserAccountAtSlot(message, i);
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

const processCommandHelp = msg => {
  let hostChannel = getHostsChannel(msg);
  let today = moment().format(constants.INPUT_DATE_FORMAT);
  hostChannel.send(new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Hosting commands')
    .setDescription(`These commands are only available in ${hostChannel}`)
    .addFields(
      { name: '\u200B', value: `**!host ${today}**\nMakes you host for selected date` },
      { name: '\u200B', value: `**!removehost ${today}**\nRemoves you from hosting for selected date` },
      { name: '\u200B', value: `**!remove ${msg.client.user} ${today}**\nRemoves mentioned person from team list for selected date` },
    ));
}

const processCommandHost = msg => {
  let date = getHostDate(msg);
  handlePromiseErrors(reactSuccess(findTeamListMessage(msg, date).then(message => {
    if (message.author != msg.client.user) {
      throw new UserError(constants.ERRORS.HOST.CANNOT_EDIT);
    }

    if (!isHostEmpty(message)) {
      throw new UserError(constants.ERRORS.HOST.NOT_EMPTY);
    }

    let content = message.content.replace(/(?<=^HOST: ).*?$/m, msg.author.toString());
    return message.edit(content);
  }), msg), msg);
}

const processCommandRemoveHost = msg => {
  let date = getRemoveHostDate(msg);
  handlePromiseErrors(reactSuccess(findTeamListMessage(msg, date).then(message => {
    if (message.author != msg.client.user) {
      throw new UserError(constants.ERRORS.HOST.CANNOT_EDIT);
    }

    if (isHostEmpty(message)) {
      throw new UserError(constants.ERRORS.HOST.NO_HOSTS);
    }

    if (!isHost(message, msg.author)) {
      throw new UserError(constants.ERRORS.HOST.OTHER_HOST);
    }

    let hostRole = getHostRoleFromChannel(message.channel);
    let content = message.content.replace(/(?<=^HOST: ).*?$/m, hostRole.toString());
    return message.edit(content);
  }), msg), msg);
}

const processCommandRemove = msg => {
  let request = parseRemoveCommand(msg);
  handlePromiseErrors(reactSuccess(findTeamListMessage(msg, request.date).then(message => {
    if (message.author != msg.client.user) {
      throw new UserError(constants.ERRORS.HOST.CANNOT_EDIT);
    }

    if (!isUserInTeamList(message, request.user)) {
      throw new UserError(constants.ERRORS.HOST.USER_NOT_FOUND);
    }

    if (isUserInBackup(message, request.user)) {
      return message.edit(message.content.replace(new RegExp(`\n${escapeRegExp(request.user)}.*$`, 'm'), ''));
    } else {
      let userInfo = getUserTextAndSlot(message.content, request.user);
      let roleInfo = getRoleTextAndIndex(userInfo.slot);
      //First remove the user
      let content = message.content.replace(userInfo.text, roleInfo.text);
      //Fill empty slots
      content = getFilledContent(message, content, userInfo.slot);

      return message.edit(content);
    }

  }), msg), msg);
}

const processHostCommand = msg => {
  if (isCommandHelp(msg)) {
    processCommandHelp(msg);
  } else if (isCommandHost(msg)) {
    processCommandHost(msg);
  } else if (isCommandRemoveHost(msg)) {
    processCommandRemoveHost(msg);
  } else if (isCommandRemove(msg)) {
    processCommandRemove(msg);
  }
}

module.exports = {
  isHostCommand,
  processHostCommand
}