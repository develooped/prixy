import { verify } from 'jsonwebtoken'
import prisma from './prismaClient'
import env from './env'

export function getUserId (request) {
  const Authorization = request.get('Authorization')

  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')

    const verifiedToken = verify(token, env.APP_SECRET)

    return verifiedToken && verifiedToken.userId
  }
}

export default (request) => ({
  ...request,
  prisma,
  userId: getUserId(request.request)
})
