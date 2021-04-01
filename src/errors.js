const constants = require('./constants');
var moment = require('moment');
const Discord = require("discord.js");

class UserError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
  toString() {
    return this.message;
  }
}

class SignupError extends UserError {};
class RemoveError extends UserError {};

const handleError = (msg, error) => {
  msg.react("❌").then(() => {
    let today = moment().format(constants.INPUT_DATE_FORMAT);
    let embed = new Discord.MessageEmbed()
      .setColor('#f54242')
      .setTitle('Error occurred while processing your request')
      .setDescription(`**__Reason: ${error}__**`);
    
    if (error instanceof SignupError) {
      embed.addFields(
        { name: 'Sign-up format', value: `Sign-up date: <DD/MM/YYYY>\nRSN: <Username>\nRole Request: <Request, N/A if you don't mind>` },
        { name: 'Example sign-up', value: `Sign-up date: ${today}\nRSN: ${msg.author.username}\nRole Request: N/A` },
      );
    } else if (error instanceof RemoveError) {
      embed.addFields(
        { name: 'Remove command format', value: `!remove <DD/MM/YYYY>` },
        { name: 'Example', value: `!remove ${today}` },
      );
    } else if (error instanceof UserError) {
      embed.setDescription(`**__Reason: ${error}__**`);
    } else {
      console.error(error);
      embed.setDescription(`**__Reason: ${constants.ERRORS.UNKNOWN}__**`);
    }
    
    return msg.author.send(embed);
  }).catch(error => {
    console.error(error);
  })
}

const handlePromiseErrors = (promise, msg) => {
  return promise.catch(error => {
    handleError(msg, error);
  })
}

module.exports = {
  UserError,
  SignupError,
  RemoveError,
  handlePromiseErrors,
  handleError
}