import path from 'path'
import { makePrismaSchema } from 'nexus-prisma'

import resolvers from './resolvers'
import client from './prismaClient'
import { GENERATED } from './paths'

const datamodelInfo = require(path.join(GENERATED, 'nexus-prisma'))

const schema = makePrismaSchema({
  types: resolvers,

  prisma: {
    datamodelInfo,
    client
  },

  outputs: {
    schema: path.join(GENERATED, 'schema.graphql'),
    typegen: path.join(GENERATED, 'nexus.ts')
  }
})

export default schema
