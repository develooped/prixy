import { GraphQLServer } from 'graphql-yoga'
import { express as voyagerMiddleware } from 'graphql-voyager/middleware'
import bodyParser from 'body-parser'
import fs from 'fs'
import { errorHandler } from 'graphql-middleware-error-handler'

import { EXTEND_EXPRESS, ERROR_HANDLER_MIDDLEWARE } from './paths'
import env from './env'

import permissions from './permissions'
import schema from './schema'

import initContext from './initContext'
import initRestAPI from './restAPI'

let onError = (error, ctx) => console.error(error)

if (fs.existsSync(ERROR_HANDLER_MIDDLEWARE)) {
  onError = require(ERROR_HANDLER_MIDDLEWARE).default
}

const errorHandlerMiddleware = errorHandler({
  onError,
  captureReturnedErrors: true,
  forwardErrors: true
})

const middlewares = [errorHandlerMiddleware, permissions]

// Register GRAPHQL Sentry middleware
if (env.SENTRY_DSN) {
  const { sentryMiddleware } = require('./sentry')

  middlewares.push(sentryMiddleware)
}

const server = new GraphQLServer({
  schema,
  middlewares,
  context: initContext
})

const app = server.express

// Register express Sentry entry-middleware
if (env.SENTRY_DSN) {
  const { registerPreSentryMiddleware } = require('./sentry')

  registerPreSentryMiddleware(app)
}

app.use(bodyParser.json({ limit: env.REQUEST_BODY_LIMIT || '1mb' }))

if (env.REST_API_PREFIX) {
  initRestAPI(app)
}

if (env.VOYAGER_URL) {
  app.use(env.VOYAGER_URL, voyagerMiddleware({ endpointUrl: '/' }))
}

if (fs.existsSync(EXTEND_EXPRESS)) {
  const extendExpress = require(EXTEND_EXPRESS).default

  if (typeof extendExpress !== 'function') {
    throw new Error('extendExpress must default export a function')
  }

  extendExpress(app)
}

// Register express Sentry result-middleware
if (env.SENTRY_DSN) {
  const { registerPostSentryMiddleware } = require('./sentry')

  registerPostSentryMiddleware(app)
}

server.start({
  endpoint: env.GQL_ENDPOINT || '',
  playground: env.GQL_ENDPOINT || '',
  port: env.PORT,
  tracing: env.GRAPHQL_TRACING,
  cors: {
    origin: env.GQL_CORS_ORIGIN || '*',
    methods: env.GQL_CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE'
  }
}, () => console.log(`Server is running on http://localhost:${env.PORT}`))
