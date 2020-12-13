require("dotenv").config()
const constants = require('./constants');
const { UserError, SignupError, sendErrorMessage, sendSignupErrorMessage } = require('./errors');
const Discord = require("discord.js")
const client = new Discord.Client({retryLimit: constants.RETRY_LIMIT})
const { isSignup, processSignUpCommand } = require('./signup');
const { isHostCommand, processHostCommand } = require('./host');

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", (msg) => {
  if (msg.author.bot || !msg.channel.name) {
    return;
  }
  try {
    if (isHostCommand(msg)) {
      processHostCommand(msg);
    } else if (isSignup(msg)) {
      processSignUpCommand(msg);
    }
  } catch(err) {
    if (err instanceof SignupError) {
      sendSignupErrorMessage(msg, err);
    } else if (err instanceof UserError) {
      sendErrorMessage(msg, err);
    } else {
      sendErrorMessage(msg, constants.ERRORS.UNKNOWN);
      throw err;
    }
  }
})

client.login(process.env.BOT_TOKEN)
