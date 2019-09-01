import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { shield } from 'graphql-shield'
import deepmerge from 'deepmerge'
import { stringify } from 'flatted/esm'

import requireAll from '../util/requireAll'
import { PERMISSIONS } from '../paths'

let shieldOptions = {
  // Shield hash function cannot handle promises (like Upload scalar)
  hashFunction: (obj) => crypto.createHash('md5').update(stringify(obj)).digest('hex')
}

const customShieldOptionsPath = path.join(PERMISSIONS, 'shieldOptions.js')

if (fs.existsSync(customShieldOptionsPath)) {
  shieldOptions = {
    ...shieldOptions,
    ...require(customShieldOptionsPath).default
  }
}

const permissions = requireAll(PERMISSIONS)

const mergedPermissions = deepmerge.all(
  permissions.reduce((acc, curr) => acc.concat(Object.values(curr)), [])
  , { clone: false }
)

export default shield(mergedPermissions, shieldOptions)
