const { PLOPFILE } = require('../lib/paths')

// The command is started by prixy generate so we must remove it from the arguments
process.argv = process.argv.filter(a => a !== 'generate')

process.argv.push('--plopfile', PLOPFILE)

require('plop/bin/plop')
