const env = require('./lib/env')
const mail = require('./lib/mail').default
const prisma = require('./lib/prismaClient').default
const initSocialLogin = require('./lib/initSocialLogin').default
const signToken = require('./lib/util/signToken').default

module.exports = {
  env,
  mail,
  prisma,
  initSocialLogin,
  signToken
}
