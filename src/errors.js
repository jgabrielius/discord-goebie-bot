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

const sendErrorMessage = (msg, message) => {
  msg.react("❌").then(() => {
    return msg.author.send(message.toString());
  }).catch(error => {
    console.error(error);
  })
}

const sendSignupErrorMessage = (msg, error) => {
  msg.react("❌").then(() => {
    let today = moment().format(constants.INPUT_DATE_FORMAT);
    return msg.author.send(new Discord.MessageEmbed()
      .setColor('#f54242')
      .setTitle('Error while processing your sign-up request')
      .setDescription(`**__Reason: ${error}__**`)
      .addFields(
        { name: '\u200B', value: `Please delete your signup and try again in ${msg.channel}` },
        { name: 'Sign-up format', value: `Sign-up date: <DD/MM/YYYY>\nRSN: <Username>\nRole Request: <Request, N/A if you don't mind>` },
        { name: 'Example sign-up', value: `Sign-up date: ${today}\nRSN: ${msg.author.username}\nRole Request: N/A` },
      ));
  }).catch(error => {
    console.error(error);
  })
}

const handlePromiseErrors = (promise, msg) => {
  return promise.catch(error => {
    if (error instanceof SignupError) {
      sendSignupErrorMessage(msg, error);
    } else if (error instanceof UserError) {
      sendErrorMessage(msg, error);
    } else {
      console.error(error);
      sendErrorMessage(msg, constants.ERRORS.UNKNOWN);
    }
  })
}

module.exports = {
  UserError,
  SignupError,
  handlePromiseErrors,
  sendErrorMessage,
  sendSignupErrorMessage
}