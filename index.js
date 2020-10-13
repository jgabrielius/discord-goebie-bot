require("dotenv").config()
const constants = require('./constants');
const Discord = require("discord.js")
const client = new Discord.Client()
var moment = require('moment');
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})
client.on("message", (msg) => {
  if (msg.author.bot || !msg.channel.name) {
    return;
  }

  let channelRegexp = new RegExp(`^(\\d\\d)${constants.SIGN_UP_CHANNEL}$`)
  let channelMatch = msg.channel.name.match(channelRegexp);

  if (channelMatch === null) {
    try {
      processHostCommand(msg);
    } catch (err) {
      sendErrorMessage(msg, err);
      return;
    }
    return;
  }

  let gt = channelMatch[1];

  let teamChannel = client.channels.cache.find(channel => channel.name === gt + constants.TEAM_LIST_CHANNEL);

  //Find highest role index user can do
  let highestRoleIndex = -1;
  msg.member.roles.cache.each(role => {
    let name = role.name;
    if (!constants.ROLES.includes(name)) {
      return;
    }
    let roleIndex = constants.ROLES.findIndex(val => {return name === val});
    if (roleIndex > highestRoleIndex) {
      highestRoleIndex = roleIndex;
    }
  });

  if (highestRoleIndex === -1) {
    sendErrorMessage(msg, constants.BAD_SIGNUP_NO_ROLE_ERROR);
    return;
  }

  let request;
  try {
    request = parseSignupRequest(msg.content);
  } catch (err) {
    sendErrorMessage(msg, err);
    return;
  }

  findTeamListMessage(teamChannel, request.date, gt).then(teamMessage => {
    if (!teamMessage.author.bot) {
      return;
    }
    let content = teamMessage.content;
    if (checkUserSignedUp(content, msg.author)) {
      sendErrorMessage(msg, constants.BAD_SIGNUP_ALREADY_SIGNED)
      return;
    }
    let freeRoles = content.match(/(?<=Spot reserved for ).*?(?= or higher)/g);
    let backup = false;
    let filledRole;
    if (freeRoles === null) {
      //No spots left, add to backup
      backup = true;
    } else {
      //Find which role user will fill
      filledRole = freeRoles.find(name => {
        let roleIndex = constants.ROLES.findIndex(val => {return name === val});
        if (roleIndex <= highestRoleIndex) {
          return name;
        }
      });

      if (!filledRole) {
        backup = true;
      }
    }
    if (backup) {
      content = content + '\n' + msg.author.toString() + ' ' + request.role;
      teamMessage.edit(content);
      msg.react("👍")
      msg.react("🅱️")
    } else {
      // Replace filled role with user
      let regexp = new RegExp('Spot reserved for ' + filledRole + ' or higher');
      content = content.replace(regexp, msg.author.toString() + ' ' + request.role);
      teamMessage.edit(content);
      msg.react("👍")
    }
  }).catch(error => {
    handleError(error);
  });
})
client.login(process.env.BOT_TOKEN)

const processHostCommand = (msg) => {
  let hostChannelRegexp = new RegExp(`^(\\d\\d)${constants.HOSTS_CHANNEL}$`)
  let hostChannelMatch = msg.channel.name.match(hostChannelRegexp);
  if (hostChannelMatch === null) {
    return;
  }
  let gt = hostChannelMatch[1];
  
  let hostCommandMatch = msg.content.match(/^!host (.*)$/);
  let date = null;
  if (hostCommandMatch !== null) {
    date = hostCommandMatch[1];
    momentDate = moment(hostCommandMatch[1], constants.SIGN_UP_DATE_FORMAT, true);
    if (!momentDate.isValid()) {
      throw constants.BAD_HOST_ERROR;
    } else if (momentDate.isBefore(moment(), 'day')) {
      throw constants.BAD_HOST_ERROR;
    } else if (momentDate.isAfter(moment().add(constants.MAX_DAYS_IN_ADVANCE, 'day'), 'day')) {
      throw constants.BAD_HOST_TOO_EARLY_ERROR;
    }
  }

  let teamChannel = client.channels.cache.find(channel => channel.name === gt + constants.TEAM_LIST_CHANNEL);

  findTeamListMessage(teamChannel, date, gt).then(teamMessage => {
    if (!teamMessage.author.bot) {
      return;
    }
    let content = teamMessage.content.replace(/(?<=^HOST: ).*?$/m, msg.author.toString());
    teamMessage.edit(content);
    msg.react("👍")
  }).catch(error => {
    handleError(error);
  });
}

const findTeamListMessage = (teamChannel, date, gt) => {
  return teamChannel.fetch().then(resp => {
    return resp.messages.fetch({limit: constants.MAX_DAYS_IN_ADVANCE + 1}).then(response => {
      let teamMessage = null;
      let foundDates = [];
      let dateMoment = moment(date, constants.SIGN_UP_DATE_FORMAT, true);

      response.each((message) => {
        let pattern = /(?:.*) (.*)$/m;
        let matches = message.content.match(pattern);
        if (matches && dateMoment.isSame(moment(matches[1], constants.SIGN_UP_DATE_FORMAT, true), 'day')) {
          teamMessage = message;
        }
        if (matches) {
          foundDates.push(matches[1]);
        }
      })

      if (teamMessage !== null) {
        return teamMessage;
      }

      //Have to create all signups up to that date
      for(let i = 0; i <= constants.MAX_DAYS_IN_ADVANCE; i++) {
        let tempMoment = moment().add(i, 'day');
        let tempDate = tempMoment.format(constants.SIGN_UP_DATE_FORMAT);
        if (!foundDates.includes(tempDate)) {
          return teamChannel.send(generateTeamListMessageText(tempDate, teamChannel.guild, gt)).then(message => {
            if (dateMoment.isSame(tempMoment, 'day')) {
              return message;
            }
          }).catch(error => {
            handleError(error);
          });
        }
      }
    })
  })
}

const parseSignupRequest = msg => {
  let messageParts = msg.split('\n'), request = {};
  if (![2,3].includes(messageParts.length)) {
    throw constants.BAD_SIGNUP_ERROR;
  }

  let date = messageParts[0].match(/^(?:Date: |Sign-up date: ?)?(.*)$/)
  if (date === null) {
    throw constants.BAD_SIGNUP_ERROR;
  }
  momentDate = moment(date[0], constants.SIGN_UP_DATE_FORMAT, true);
  if (!momentDate.isValid()) {
    throw constants.BAD_SIGNUP_DATE_ERROR;
  } else if (momentDate.isBefore(moment(), 'day')) {
    throw constants.BAD_SIGNUP_DATE_ERROR;
  } else if (momentDate.isAfter(moment().add(constants.MAX_DAYS_IN_ADVANCE, 'day'), 'day')) {
    throw constants.BAD_SIGNUP_TOO_EARLY_ERROR;
  }
  request.date = date[0];

  let rsn = messageParts[1].match(/^(?:RSN: ?)?(.*)$/)
  if (rsn === null) {
    throw constants.BAD_SIGNUP_ERROR;
  }
  request.rsn = rsn[0];

  if (messageParts.length === 2) {
    request.role = '';
    return request;
  }

  let role = messageParts[2].match(/^(?:Role Request: ?)?(.*)$/)
  if (role === null) {
    request.role = '';
    return request;
  }
  request.role = role[0];
  return request;
}

const checkUserSignedUp = (content, user) => {
  if (process.env.ALLOW_MULTIPLE_SIGNUPS === 'true') {
    return false;
  }
  let regexp = new RegExp(user.toString());
  return !!content.match(regexp);
}

const generateTeamListMessageText = (requestDate, guild, gt) => {
  let hostRole = guild.roles.cache.find(r => r.name === constants.HOST_ROLE);
  return `Raid team 1, ${gt}.00 GT ${requestDate}

HOST: ${hostRole}
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

const sendErrorMessage = (originalMessage, message) => {
  originalMessage.react("❌")
  originalMessage.author.send(message);
}

const handleError = error => {
  console.log(error);
}