require("dotenv").config()
const constants = require('./constants');
const { handleError } = require('./errors');
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
  } catch (error) {
    handleError(msg, error);
  }
})

client.login(process.env.BOT_TOKEN)
