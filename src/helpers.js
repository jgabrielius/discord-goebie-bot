const constants = require('./constants');
const { UserError } = require('./errors');
var moment = require('moment');

const getGameTimeFromMessage = msg => {
  return getGameTimeFromChannel(msg.channel);
}

const getGameTimeFromChannel = channel => {
  return channel.name.substring(0, 2);
}

const getTeamChannel = msg => {
  return msg.guild.channels.cache.find(channel => channel.name === getGameTimeFromMessage(msg) + constants.TEAM_LIST_CHANNEL);
}

const getHostRoleFromChannel = channel => {
  return channel.guild.roles.cache.find(r => r.name === constants.HOST_ROLE);
}

const validateDate = date => {
  momentDate = moment(date, constants.INPUT_DATE_FORMAT, true);
  if (!momentDate.isValid()) {
    throw new UserError(constants.ERRORS.SIGN_UP.INVALID_DATE);
  } else if (momentDate.isBefore(moment(), 'day')) {
    throw new UserError(constants.ERRORS.SIGN_UP.PAST_DATE);
  } else if (momentDate.isAfter(moment().add(constants.MAX_DAYS_IN_ADVANCE, 'day'), 'day')) {
    throw new UserError(constants.ERRORS.SIGN_UP.EARLY_DATE);
  }
  return momentDate;
}

const generateTeamListMessageText = (teamChannel, requestMoment) => {
  let gt = getGameTimeFromChannel(teamChannel);
  let hostRole = getHostRoleFromChannel(teamChannel);
  requestDate = requestMoment.format('D/M/YYYY');
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

const findTeamListMessage = (msg, date) => {
  let teamChannel = getTeamChannel(msg);
  return teamChannel.fetch().then(resp => {
    return resp.messages.fetch({limit: constants.MAX_DAYS_IN_ADVANCE + 1}).then(response => {
      let foundDates = [];
      let teamMessage = response.find(message => {
        let matches = message.content.match(/(?:.*) (.*)$/m);
        if (matches) {
          if (date.isSame(moment(matches[1], constants.TEAM_LIST_DATE_FORMAT, true), 'day')) {
            return message;
          }
          foundDates.push(matches[1]);
        }
      })
      if (teamMessage !== undefined) {
        return teamMessage;
      }

      //Create lists for all days up to requested
      let promises = [];
      for(let i = 0; i <= constants.MAX_DAYS_IN_ADVANCE; i++) {
        let tempMoment = moment().add(i, 'day');
        let tempDate = tempMoment.format(constants.TEAM_LIST_DATE_FORMAT);
        if (!foundDates.includes(tempDate)) {
          if (date.isBefore(tempMoment, 'day')) {
            break;
          }
          promises.push(teamChannel.send(generateTeamListMessageText(teamChannel, tempMoment)).then(message => {
            if (date.isSame(tempMoment, 'day')) {
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

const reactSuccess = (promise, msg) => {
  return promise.then(() => {
    return msg.react("👍");
  })
}

const findHighestRoleIndex = user => {
  let highestRoleIndex = -1;
  user.roles.cache.each(role => {
    let roleIndex = constants.ROLES.findIndex(val => {return role.name === val});
    if (roleIndex > highestRoleIndex) {
      highestRoleIndex = roleIndex;
    }
  });
  return highestRoleIndex;
}

const escapeRegExp = string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

module.exports = {
  getGameTimeFromMessage,
  getTeamChannel,
  getHostRoleFromChannel,
  validateDate,
  findTeamListMessage,
  reactSuccess,
  findHighestRoleIndex,
  escapeRegExp
}