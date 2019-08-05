import { shield, deny } from 'graphql-shield'
import deepmerge from 'deepmerge'

import requireAll from '../util/requireAll'
import { PERMISSIONS } from '../paths'

const permissions = requireAll(PERMISSIONS)

const basePermissions = {
  Query: {
    '*': deny
  },
  Mutation: {
    '*': deny
  }
}

const mergedPermissions = deepmerge.all([
  basePermissions,
  ...permissions.reduce((acc, curr) => acc.concat(Object.values(curr)), [])
], { clone: false })

export default shield(mergedPermissions)
