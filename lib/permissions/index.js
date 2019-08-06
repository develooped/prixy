import { shield } from 'graphql-shield'
import deepmerge from 'deepmerge'

import requireAll from '../util/requireAll'
import { PERMISSIONS } from '../paths'

const permissions = requireAll(PERMISSIONS)

const mergedPermissions = deepmerge.all(
  permissions.reduce((acc, curr) => acc.concat(Object.values(curr)), [])
  , { clone: false }
)

export default shield(mergedPermissions, { debug: true })
