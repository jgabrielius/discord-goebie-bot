require("dotenv").config()
const constants = require('./constants');
const {UserError} = require('./errors');
const Discord = require("discord.js")
const client = new Discord.Client({retryLimit: constants.RETRY_LIMIT})
var moment = require('moment');

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", (msg) => {
  if (msg.author.bot || !msg.channel.name) {
    return;
  }

  let channelMatch = msg.channel.name.match(new RegExp(`^(\\d\\d)${constants.SIGN_UP_CHANNEL}$`));
  if (channelMatch === null) {
    try {
      processHostCommand(msg);
    } catch(err) {
      if (err instanceof UserError) {
        sendErrorMessage(msg, err);
      } else {
        throw err;
      }
    }
    return;
  }

  var gt = channelMatch[1];
  var teamChannel = client.channels.cache.find(channel => channel.name === gt + constants.TEAM_LIST_CHANNEL);

  //Find highest role index user can do
  var highestRoleIndex = findHighestRoleIndex(msg.member);

  if (highestRoleIndex === -1) {
    sendErrorMessage(msg, constants.ERRORS.SIGN_UP.NO_ROLE);
    return;
  }

  try {
    var request = parseSignupRequest(msg.content);
  } catch (err) {
    if (err instanceof UserError) {
      sendErrorMessage(msg, err);
      return;
    } else {
      throw err;
    }
  }

  handlePromiseErrors(findTeamListMessage(teamChannel, request.date, gt).then(teamMessage => {
    if (!teamMessage.author.bot) {
      return;
    }
    let content = teamMessage.content;
    if (checkUserSignedUp(content, msg.author)) {
      throw new UserError(constants.ERRORS.SIGN_UP.ALREADY_SIGNED);
    }
    let freeRoles = content.match(/(?<=Spot reserved for ).*?(?= or higher)/g) || [];
    let filledRole;
    //Find which role user will fill
    filledRole = freeRoles.find(name => {
      let roleIndex = constants.ROLES.findIndex(val => {return name === val});
      if (roleIndex <= highestRoleIndex) {
        return name;
      }
    });
    if (!filledRole) {
      content = content + '\n' + msg.author.toString() + ' ' + request.role;
      return teamMessage.edit(content).then(resp => {
        return msg.react("👍")
      }).then(resp => {
        return msg.react("🅱️")
      });
    }
    // Replace filled role with user
    let regexp = new RegExp('Spot reserved for ' + filledRole + ' or higher');
    content = content.replace(regexp, msg.author.toString() + ' ' + request.role);
    return teamMessage.edit(content).then(resp => {
      return msg.react("👍");
    });
  }), msg);
})
client.login(process.env.BOT_TOKEN)

const processHostCommand = (msg) => {
  let hostChannelMatch = msg.channel.name.match(new RegExp(`^(\\d\\d)${constants.HOSTS_CHANNEL}$`));
  if (hostChannelMatch === null) {
    return;
  }

  let gt = hostChannelMatch[1];
  let teamChannel = client.channels.cache.find(channel => channel.name === gt + constants.TEAM_LIST_CHANNEL);
  
  if (msg.content.match(/!help/)) {
    let hostChannel = client.channels.cache.find(channel => channel.name === gt + constants.HOSTS_CHANNEL);
    const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Hosting commands')
    .setDescription('These commands are only available in ' + hostChannel.toString())
    .addFields(
      { name: '\u200B', value: '**!host ' + moment().format(constants.SIGN_UP_DATE_FORMAT) + '**\nMakes you host for selected date' },
      { name: '\u200B', value: '**!removehost ' + moment().format(constants.SIGN_UP_DATE_FORMAT) + '**\nRemoves you from hosting for selected date' },
      { name: '\u200B', value: '**!remove #2' + ' ' + moment().format(constants.SIGN_UP_DATE_FORMAT) + '**\nRemoves person with specified # from team list for selected date', },
      { name: '\u200B', value: '**!remove ' + client.user.toString() + ' ' + moment().format(constants.SIGN_UP_DATE_FORMAT) + '**\nRemoves mentioned person from team list for selected date', },
      )
    hostChannel.send(embed);
    return;
  }
    
  let hostCommandMatch = msg.content.match(/^!host (.*)$/);
  let date = null, user = null, selectedCommand = null;
  if (hostCommandMatch !== null) {
    date = validateSignUpDate(hostCommandMatch[1]);
    selectedCommand = '!host';
  } else {
    let removeCommandMatch = msg.content.match(/^!remove (<.*>) (.*)$/);
    if (removeCommandMatch !== null) {
      user = removeCommandMatch[1].replace('!', '');
      date = validateSignUpDate(removeCommandMatch[2]);
      selectedCommand = '!remove';
    } else {
      let removeHostCommandMatch = msg.content.match(/^!removehost (.*)$/);
      if (removeHostCommandMatch !== null) {
        date = validateSignUpDate(removeHostCommandMatch[1]);
        selectedCommand = '!removehost';
      }
    }
  }

  if (selectedCommand === null) {
    return;
  }

  handlePromiseErrors(findTeamListMessage(teamChannel, date, gt).then(teamMessage => {
    if (!teamMessage.author.bot) {
      return;
    }
    let hostRole = teamMessage.channel.guild.roles.cache.find(r => r.name === constants.HOST_ROLE);
    if (selectedCommand === '!host') {
      if (!teamMessage.content.match(new RegExp(`^HOST: ${hostRole.toString()}$`, 'm'))) {
        throw new UserError(constants.ERRORS.HOST.NOT_EMPTY);
      }
      let content = teamMessage.content.replace(/(?<=^HOST: ).*?$/m, msg.author.toString());
      return teamMessage.edit(content);
    } else if (selectedCommand === '!removehost'){
      if (!teamMessage.content.match(new RegExp(`^HOST: ${msg.author.toString()}$`, 'm'))) {
        throw new UserError(constants.ERRORS.HOST.OTHER_HOST);
      }
      let content = teamMessage.content.replace(/(?<=^HOST: ).*?$/m, hostRole.toString());
      return teamMessage.edit(content);
    } else if (selectedCommand === '!remove') {
      let replaceMatch = teamMessage.content.match(new RegExp(`^#(\\d\\d?): (${user}.*)$`, 'm'));
      let number, replaceText, replacedText, content = teamMessage.content;
      if (replaceMatch === null) {
        //If a person is not in team list check if he's in backup list
        replaceMatch = teamMessage.content.match(new RegExp(`^${user}.*$`, 'm'));
        if (replaceMatch === null) {
          throw new UserError(constants.ERRORS.HOST.USER_NOT_FOUND);
        } else {
          replaceText = new RegExp(`\n${user}.*$`, 'm')
          replacedText = '';
        }
      } else {
        let replacedRoleIndex;
        number = replaceMatch[1];
        replaceText = replaceMatch[2];
        switch (number) {
          case '2':
          case '3':
            replacedText = 'Spot reserved for Ancient Goebie or higher';
            replacedRoleIndex = 5;
            break;
          case '4':
          case '5':
            replacedText = 'Spot reserved for Goebie Ranger or higher';
            replacedRoleIndex = 3;
            break
          case '6':
          case '7':
            replacedText = 'Spot reserved for Goebie Fetcher or higher';
            replacedRoleIndex = 2;
            break;
          case '8':
            replacedText = 'Spot reserved for Goebie Caretaker or higher';
            replacedRoleIndex = 1;
            break;
          case '9':
          case '10':
            replacedText = 'Spot reserved for Young Goebie or higher';
            replacedRoleIndex = 0;
            break
          default: 
          throw new UserError(constants.ERRORS.UNKNOWN);
        }
        let backupList = teamMessage.content.match(new RegExp(/(?<=Backup:\n).*$/, 'sm'));
        if (backupList !== null) {
          let backupMembers = backupList[0].split('\n');
          let replacedMember = backupMembers.find(member => {
            let memberTag = member.match(/(?<=<@).*(?=>)/);
            let guildMember = teamMessage.channel.guild.members.cache.get(memberTag[0]);
            return findHighestRoleIndex(guildMember) >= replacedRoleIndex
          });
          if (replacedMember) {
            content = content.replace(new RegExp(`\n${escapeRegExp(replacedMember)}`, 'm'), '');
            replacedText = replacedMember;
          }
        }
      }
      content = content.replace(replaceText, replacedText);
      return teamMessage.edit(content);
    }
  }).then(resp => {
    return msg.react("👍");
  }), msg);
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
      let promises = [];
      for(let i = 0; i <= constants.MAX_DAYS_IN_ADVANCE; i++) {
        let tempMoment = moment().add(i, 'day');
        let tempDate = tempMoment.format(constants.SIGN_UP_DATE_FORMAT);
        if (!foundDates.includes(tempDate)) {
          if (dateMoment.isBefore(tempMoment, 'day')) {
            break;
          }
          promises.push(teamChannel.send(generateTeamListMessageText(tempMoment, teamChannel.guild, gt)).then(message => {
            if (dateMoment.isSame(tempMoment, 'day')) {
              teamMessage = message;
            }
          }));
        }
      }
      return Promise.all(promises).then(() => {
        return teamMessage
      })
    })
  })
}

const parseSignupRequest = msg => {
  let messageParts = msg.split('\n'), request = {};
  if (![2,3].includes(messageParts.length)) {
    throw new UserError(constants.ERRORS.SIGN_UP.INVALID_FORMAT);
  }

  let date = messageParts[0].match(/^(?:Date: |Sign-up date: ?)?(.*)$/)
  if (date === null) {
    throw new UserError(constants.ERRORS.SIGN_UP.INVALID_FORMAT);
  }
  request.date = validateSignUpDate(date[1]);

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

const checkUserSignedUp = (content, user) => {
  if (process.env.ALLOW_MULTIPLE_SIGNUPS === 'true') {
    return false;
  }
  let regexp = new RegExp(user.toString());
  return !!content.match(regexp);
}

const validateSignUpDate = date => {
  momentDate = moment(date, constants.SIGN_UP_DATE_FORMAT, true);
  if (!momentDate.isValid()) {
    throw new UserError(constants.ERRORS.SIGN_UP.INVALID_DATE);
  } else if (momentDate.isBefore(moment(), 'day')) {
    throw new UserError(constants.ERRORS.SIGN_UP.PAST_DATE);
  } else if (momentDate.isAfter(moment().add(constants.MAX_DAYS_IN_ADVANCE, 'day'), 'day')) {
    throw new UserError(constants.ERRORS.SIGN_UP.EARLY_DATE);
  }
  return date;
}

const findHighestRoleIndex = member => {
  let highestRoleIndex = -1;
  member.roles.cache.each(role => {
    let name = role.name;
    if (!constants.ROLES.includes(name)) {
      return;
    }
    let roleIndex = constants.ROLES.findIndex(val => {return name === val});
    if (roleIndex > highestRoleIndex) {
      highestRoleIndex = roleIndex;
    }
  });
  return highestRoleIndex;
}

const generateTeamListMessageText = (requestMoment, guild, gt) => {
  let hostRole = guild.roles.cache.find(r => r.name === constants.HOST_ROLE);
  requestDate = requestMoment.format('DD-MM-YYYY');
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
  originalMessage.react("❌").then(resp => {
    return originalMessage.author.send(message.toString());
  }).catch(error => {
    handleError(error);
  })
}

const handleError = error => {
  console.error(error);
}

const handlePromiseErrors = (promise, msg) => {
  return promise.catch(error => {
    if (error instanceof UserError) {
      sendErrorMessage(msg, error);
    } else {
      console.error(error);
      sendErrorMessage(msg, constants.ERRORS.UNKNOWN);
    }
  })
}

const escapeRegExp = string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}