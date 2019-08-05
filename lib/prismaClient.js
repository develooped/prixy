import path from 'path'
import env from './env'
import { GENERATED } from './paths'

const { Prisma } = require(path.join(GENERATED, 'prisma-client'))

export default new Prisma({
  endpoint: env.PRISMA_ENDPOINT,
  debug: false
})
