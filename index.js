const env = require('./lib/env')
const mail = require('./lib/mail')

module.exports = {
  env,
  mail: mail.default
}
