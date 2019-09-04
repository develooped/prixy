import useSofa, { OpenAPI } from 'sofa-api'
import swaggerUi from 'swagger-ui-express'

import env from './env'
import schema from './schema'
import prisma from './prismaClient'

export default function initRestAPI (app) {
  const openApi = OpenAPI({
    schema,
    info: {
      title: env.API_TITLE,
      version: env.API_VERSION
    }
  })

  app.use(
    env.REST_API_PREFIX,
    useSofa({
      schema,
      async context ({ req }) {
        return {
          request: req, // The 'request' key is required
          prisma
        }
      },
      /**
       * Swagger paths will be gathered by this method only!
       */
      onRoute (info) {
        openApi.addRoute(info, {
          basePath: env.REST_API_PREFIX
        })
      }
    }))

  openApi.save('./generated/swagger.json')

  if (env.SWAGGER_PATH) {
    app.use(env.SWAGGER_PATH, swaggerUi.serve, swaggerUi.setup(openApi.get()))
  }
}
