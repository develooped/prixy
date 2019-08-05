const fs = require('fs')
const dotenvParseVariables = require('dotenv-parse-variables')
const path = require('path')
const { PROJECT_ROOT } = require('./paths')

const NODE_ENV = process.env.NODE_ENV || 'development'

const env = [
  `.env.${NODE_ENV}`,
  `.env.${NODE_ENV}.local`,
  '.env',
  '.env.local'
].map(f => path.join(PROJECT_ROOT, f))
  .reduce((acc, dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
      const { parsed } = require('dotenv').config({
        path: dotenvFile
      })

      return {
        ...acc,
        ...dotenvParseVariables(parsed)
      }
    }

    return acc
  }, {})

module.exports = env
