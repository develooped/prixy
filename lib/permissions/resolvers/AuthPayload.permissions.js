import { isAuthenticatedUser } from '../rules'
import { not } from 'graphql-shield'

export default {
  Mutation: {
    login: not(isAuthenticatedUser),
    signup: not(isAuthenticatedUser)
  }
}
