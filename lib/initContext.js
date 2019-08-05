import prisma from './prismaClient'
import { CONTEXT } from './paths'

const additionalContextModule = require(CONTEXT)

export default (request) => {
  let additionalContext = {}

  if (additionalContextModule) {
    additionalContext = additionalContextModule.default(request)
  }

  return {
    ...request,
    prisma,
    ...additionalContext
  }
}
