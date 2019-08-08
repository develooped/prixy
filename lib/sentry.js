import { sentry } from 'graphql-middleware-sentry'
import path from 'path'

import env from './env'
import { PROJECT_ROOT } from './paths'

const packageJSON = require(path.join(PROJECT_ROOT, 'package.json'))

const Sentry = require('@sentry/node')

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.NODE_ENV,
  release: `${packageJSON.name}@${packageJSON.version}`
})

export const sentryMiddleware = sentry({
  sentryInstance: Sentry,
  withScope: (scope, error, context) => {
    scope.setUser({
      id: context.userId
    })
    scope.setExtra('body', context.request.body)
    scope.setExtra('origin', context.request.headers.origin)
    scope.setExtra('user-agent', context.request.headers['user-agent'])
  },
  forwardErrors: true
})

export const registerPreSentryMiddleware = (app) => {
  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler())
}

export const registerPostSentryMiddleware = (app) => {
  // The error handler must be before any other error middleware
  app.use(Sentry.Handlers.errorHandler())
}

export default Sentry
