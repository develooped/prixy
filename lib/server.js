import { GraphQLServer } from 'graphql-yoga'
import { express as voyagerMiddleware } from 'graphql-voyager/middleware'

import env from './env'

import permissions from './permissions'
import schema from './schema'

import initContext from './initContext'
import initRestAPI from './restAPI'

const middlewares = [permissions]

if (env.SENTRY_DSN) {
  const { sentryMiddleware } = require('./sentry')

  middlewares.unshift(sentryMiddleware)
}

const server = new GraphQLServer({
  schema,
  middlewares,
  context: initContext
})

if (env.REST_API_PREFIX) {
  initRestAPI(server.express)
}

if (env.VOYAGER_URL) {
  server.express.use(env.VOYAGER_URL, voyagerMiddleware({ endpointUrl: '/' }))
}

server.start({
  port: env.PORT,
  tracing: env.GRAPHQL_TRACING
}, () => console.log(`Server is running on http://localhost:${env.PORT}`))
