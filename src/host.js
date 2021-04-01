const constants = require('./constants');
const { validateDate, findTeamListMessage, getHostRoleFromChannel, reactSuccess, escapeRegExp, findHighestRoleIndex } = require('./helpers');
const Discord = require("discord.js");
var moment = require('moment');
const { UserError, handlePromiseErrors } = require('./errors');
const { removePersonFromTeam } = require('./remove');

const hostCommandRegex = /^!host \s*(.*)$/;
const removeHostCommandRegex = /^!removehost \s*(.*)$/;
const removeCommandRegex = /^!remove \s*(<.*>) \s*(.*)$/;
const helpCommandRegex = /^!mahelp$/;
const listCommandRegex = /^!list\s*$/;

const isHostCommand = msg => {
  return new RegExp(`^(\\d\\d)${constants.HOSTS_CHANNEL}$`).test(msg.channel.name);
}

const getHostsChannel = msg => {
  return msg.channel;
}

const isCommandHelp = msg => {
  return helpCommandRegex.test(msg.content);
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

const isCommandList = msg => {
  return listCommandRegex.test(msg.content);
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
      { name: '\u200B', value: `**!list**\nSends a private message with today's list formatted for copying and pasting` },
    ));
}

const processCommandHost = msg => {
  let date = getHostDate(msg);
  handlePromiseErrors(reactSuccess(findTeamListMessage(msg, date).then(message => {
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
  removePersonFromTeam(msg, request.date, request.user);
}

const processCommandList = msg => {
  handlePromiseErrors(reactSuccess(findTeamListMessage(msg, moment()).then(message => {
    let content = message.content;
    message.mentions.users.map(user => {
      content = content.replace(user.toString(), '@' + user.username);
    })
    message.mentions.roles.map(role => {
      content = content.replace(role.toString(), '@' + role.name);
    })
    content = content.split('Backup:')[0] + "Log in and ask for invites! Replacing at :50 GT";
    return msg.author.send(content);
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
  } else if (isCommandList(msg)) {
    processCommandList(msg);
  }
}

module.exports = {
  isHostCommand,
  processHostCommand
}