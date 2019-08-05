import { rule } from 'graphql-shield'

export const isAuthenticatedUser = rule()((parent, args, context) => {
  return !!context.userId
})
