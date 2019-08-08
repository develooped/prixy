import { sign } from 'jsonwebtoken'
import fs from 'fs'
import env from '../env'
import { SIGN_TOKEN_PATH } from '../paths'

let signTokenFunction = (user) => {
  return sign({ userId: user.id }, env.APP_SECRET, { expiresIn: env.JWT_EXPIRE || '1d' })
}

if (fs.existsSync(SIGN_TOKEN_PATH)) {
  signTokenFunction = require(SIGN_TOKEN_PATH).default
}

export default signTokenFunction
