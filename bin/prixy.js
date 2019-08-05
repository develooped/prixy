#!/usr/bin/env node --preserve-symlinks

const program = require('commander')
const packageJson = require('../package.json')
const NOOP = function () {}

program.version(packageJson.version, '-v, --version')

let cmd
cmd = program.command('start')
cmd.option('--prod', 'Lift in "production" environment.')
cmd.option('--staging', 'Lift in "staging" environment.')
cmd.option('--port [port]', 'Listen on the specified port (defaults to 1337).')
cmd.option('--silent', 'Set log level to "silent".')
cmd.option('--verbose', 'Set log level to "verbose".')
cmd.option('--silly', 'Set log level to "silly".')
cmd.unknownOption = NOOP
cmd.description('')
cmd.action(() => require('./prixy-start'))

cmd = program.command('generate')
cmd.unknownOption = NOOP
cmd.description('')
cmd.action(async () => require('./prixy-generate'))

program
  .command('*')
  .action(function (cmd) {
    console.log('\n  ** Unrecognized command:', cmd, '**')
    program.help()
  })

// Don't balk at unknown options
program.unknownOption = NOOP

// $ sails
//
program.parse(process.argv)
