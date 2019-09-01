import { GraphQLServer } from 'graphql-yoga'
import { express as voyagerMiddleware } from 'graphql-voyager/middleware'
import fs from 'fs'

import { EXTEND_EXPRESS } from './paths'
import env from './env'

import permissions from './permissions'
import schema from './schema'

import initContext from './initContext'
import initRestAPI from './restAPI'

const middlewares = [permissions]

if (env.SENTRY_DSN) {
  const { sentryMiddleware } = require('./sentry')

  middlewares.push(sentryMiddleware)
}

const server = new GraphQLServer({
  schema,
  middlewares,
  context: initContext
})

if (env.SENTRY_DSN) {
  const { registerPreSentryMiddleware } = require('./sentry')

  registerPreSentryMiddleware(server.express)
}

if (env.REST_API_PREFIX) {
  initRestAPI(server.express)
}

if (env.VOYAGER_URL) {
  server.express.use(env.VOYAGER_URL, voyagerMiddleware({ endpointUrl: '/' }))
}

if (fs.existsSync(EXTEND_EXPRESS)) {
  const extendExpress = require(EXTEND_EXPRESS).default

  if (typeof extendExpress !== 'function') {
    throw new Error('extendExpress must default export a function')
  }

  extendExpress(server.express)
}

if (env.SENTRY_DSN) {
  const { registerPostSentryMiddleware } = require('./sentry')

  registerPostSentryMiddleware(server.express)
}

server.start({
  endpoint: env.GQL_ENDPOINT || '',
  playground: env.GQL_ENDPOINT || '',
  port: env.PORT,
  tracing: env.GRAPHQL_TRACING
}, () => console.log(`Server is running on http://localhost:${env.PORT}`))
