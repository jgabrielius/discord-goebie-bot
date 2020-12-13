const constants = require('./constants');

class UserError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
  toString() {
    return this.message;
  }
}

const sendErrorMessage = (msg, message) => {
  msg.react("❌").then(() => {
    return msg.author.send(message.toString());
  }).catch(error => {
    console.error(error);
  })
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

module.exports = {
  UserError,
  handlePromiseErrors,
  sendErrorMessage
}