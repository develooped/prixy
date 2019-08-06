import { shield } from 'graphql-shield'
import deepmerge from 'deepmerge'
import path from 'path'

import requireAll from '../util/requireAll'
import { PERMISSIONS } from '../paths'

const shieldOptions = require(path.join(PERMISSIONS, 'shieldOptions')) || {}

const permissions = requireAll(PERMISSIONS)

const mergedPermissions = deepmerge.all(
  permissions.reduce((acc, curr) => acc.concat(Object.values(curr)), [])
  , { clone: false }
)

export default shield(mergedPermissions, shieldOptions.default || shieldOptions)
