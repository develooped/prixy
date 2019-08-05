const fs = require('fs')
const { DefaultParser, DatabaseType } = require('prisma-datamodel')
const pluralize = require('pluralize')
const camelcase = require('camelcase')
const path = require('path')
const { PROJECT_ROOT } = require('./lib/paths')

const parser = DefaultParser.create(DatabaseType.postgres)
const { types: allTypes } = parser.parseFromSchemaString(fs.readFileSync('./prisma/datamodel.prisma', 'utf8'))

// Only simple types are supported currently
const types = allTypes
  .filter(type => !type.isEmbedded && !type.isEnum && !type.isLinkTable)
  .sort((a, b) => a.name.localeCompare(b.name))

const selectType = name => types.find(t => t.name === name)

module.exports = function (plop) {
  plop.setWelcomeMessage('What can I do for you?')

  // ████████╗██╗   ██╗██████╗ ███████╗
  // ╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝
  //    ██║    ╚████╔╝ ██████╔╝█████╗
  //    ██║     ╚██╔╝  ██╔═══╝ ██╔══╝
  //    ██║      ██║   ██║     ███████╗
  //    ╚═╝      ╚═╝   ╚═╝     ╚══════╝

  plop.setGenerator('type', {
    description: 'Generate nexus-prisma type binding for a model. These fields will be only accessible from GQL!',
    prompts: [{
      type: 'list',
      name: 'type',
      message: 'Select prisma model to generate binding for',
      choices: types.map(type => type.name).filter(type => !fs.existsSync(`src/resolvers/${type}/${type}.type.js`))
    }, {
      type: 'checkbox',
      name: 'fields',
      message: 'Select fields to include in GraphQL scheme',
      choices: ({ type }) => selectType(type).fields.map(f => ({ name: f.name, checked: f.name !== 'password' }))
    }],
    actions: data => {
      data.connection = pluralize(camelcase(data.type)) + 'Connection'

      return [{
        type: 'add',
        path: path.join(PROJECT_ROOT, 'src/resolvers/{{type}}/{{type}}.type.js'),
        templateFile: 'templates/type.hbs'
      }]
    }
  })

  // ██████╗ ██╗   ██╗███████╗██████╗ ██╗   ██╗
  // ██╔═══██╗██║   ██║██╔════╝██╔══██╗╚██╗ ██╔╝
  // ██║   ██║██║   ██║█████╗  ██████╔╝ ╚████╔╝
  // ██║▄▄ ██║██║   ██║██╔══╝  ██╔══██╗  ╚██╔╝
  // ╚██████╔╝╚██████╔╝███████╗██║  ██║   ██║
  //  ╚══▀▀═╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝

  plop.setGenerator('query', {
    description: 'Generate nexus-prisma query binding for a model. (Select one/select many)',
    prompts: [{
      type: 'list',
      name: 'type',
      message: 'Select prisma model to generate binding for',
      choices: types.map(type => type.name)
    }, {
      type: 'checkbox',
      name: 'fields',
      message: 'Select queries to include in GraphQL scheme',
      choices: ({ type }) => [{
        name: 'Select by unique identifier (' + camelcase(type) + ')',
        value: camelcase(type),
        checked: true
      }, {
        name: 'Select by where clause (' + pluralize(camelcase(type)) + ')',
        value: pluralize(camelcase(type)),
        checked: true
      }, {
        name: 'Relay typed connection (' + pluralize(camelcase(type)) + 'Connection)',
        value: pluralize(camelcase(type)) + 'Connection',
        checked: true
      }]
    }],
    actions: data => {
      return [{
        type: 'add',
        path: path.join(PROJECT_ROOT, 'src/resolvers/{{type}}/{{type}}.query.js'),
        templateFile: 'templates/query.hbs'
      }]
    }
  })

  // ███╗   ███╗██╗   ██╗████████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
  // ████╗ ████║██║   ██║╚══██╔══╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
  // ██╔████╔██║██║   ██║   ██║   ███████║   ██║   ██║██║   ██║██╔██╗ ██║
  // ██║╚██╔╝██║██║   ██║   ██║   ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
  // ██║ ╚═╝ ██║╚██████╔╝   ██║   ██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
  // ╚═╝     ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

  // createUser updateUser updateManyUsers upsertUser deleteUser deleteManyUsers
  plop.setGenerator('mutation', {
    description: 'Generate nexus-prisma mutation binding for a model',
    prompts: [{
      type: 'list',
      name: 'type',
      message: 'Select prisma model to generate binding for',
      choices: types.map(type => type.name)
    }, {
      type: 'checkbox',
      name: 'fields',
      message: 'Select mutations to include in GraphQL scheme',
      choices: ({ type }) => [
        `create${type}`,
        `update${type}`,
        `updateMany${pluralize(type)}`,
        `upsert${type}`,
        `delete${type}`,
        `deleteMany${pluralize(type)}`
      ].map(c => ({
        name: c,
        value: c,
        checked: true
      }))
    }],
    actions: data => {
      return [{
        type: 'add',
        path: path.join(PROJECT_ROOT, 'src/resolvers/{{type}}/{{type}}.mutations.js'),
        templateFile: 'templates/mutations.hbs'
      }]
    }
  })

  // ██╗███╗   ██╗██████╗ ██╗   ██╗████████╗    ████████╗██╗   ██╗██████╗ ███████╗
  // ██║████╗  ██║██╔══██╗██║   ██║╚══██╔══╝    ╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝
  // ██║██╔██╗ ██║██████╔╝██║   ██║   ██║          ██║    ╚████╔╝ ██████╔╝█████╗
  // ██║██║╚██╗██║██╔═══╝ ██║   ██║   ██║          ██║     ╚██╔╝  ██╔═══╝ ██╔══╝
  // ██║██║ ╚████║██║     ╚██████╔╝   ██║          ██║      ██║   ██║     ███████╗
  // ╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝    ╚═╝          ╚═╝      ╚═╝   ╚═╝     ╚══════╝

  plop.setGenerator('create input types', {
    description: 'Generate nexus-prisma create input bindings for a model',
    prompts: [{
      type: 'list',
      name: 'type',
      message: 'Select prisma model to generate binding for',
      choices: types.map(type => type.name)
    }, {
      type: 'checkbox',
      name: 'fields',
      message: 'Select input fields to include in GraphQL scheme',
      choices: ({ type }) => selectType(type).fields
        .filter(f => !f.isReadOnly || f.isId)
        .map(f => ({ name: f.name, checked: true }))
    }],
    actions: data => {
      return [{
        type: 'add',
        path: path.join(PROJECT_ROOT, 'src/resolvers/{{type}}/{{type}}.createInput.js'),
        templateFile: 'templates/createInput.hbs'
      }]
    }
  })

  plop.setGenerator('update input types', {
    description: 'Generate nexus-prisma update input bindings for a model',
    prompts: [{
      type: 'list',
      name: 'type',
      message: 'Select prisma model to generate binding for',
      choices: types.map(type => type.name)
    }, {
      type: 'checkbox',
      name: 'fields',
      message: 'Select input fields to include in GraphQL scheme',
      choices: ({ type }) => selectType(type).fields
        .filter(f => !f.isReadOnly)
        .map(f => ({ name: f.name, checked: true }))
    }],
    actions: data => {
      return [{
        type: 'add',
        path: path.join(PROJECT_ROOT, 'src/resolvers/{{type}}/{{type}}.updateInput.js'),
        templateFile: 'templates/updateInput.hbs'
      }]
    }
  })

  // ███████╗██╗   ██╗██████╗ ███████╗ ██████╗██████╗ ██╗██████╗ ████████╗██╗ ██████╗ ███╗   ██╗
  // ██╔════╝██║   ██║██╔══██╗██╔════╝██╔════╝██╔══██╗██║██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
  // ███████╗██║   ██║██████╔╝███████╗██║     ██████╔╝██║██████╔╝   ██║   ██║██║   ██║██╔██╗ ██║
  // ╚════██║██║   ██║██╔══██╗╚════██║██║     ██╔══██╗██║██╔═══╝    ██║   ██║██║   ██║██║╚██╗██║
  // ███████║╚██████╔╝██████╔╝███████║╚██████╗██║  ██║██║██║        ██║   ██║╚██████╔╝██║ ╚████║
  // ╚══════╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝

  plop.setGenerator('create subscription', {
    description: 'Generate nexus-prisma subscription bindings for a model',
    prompts: [{
      type: 'list',
      name: 'type',
      message: 'Select prisma model to generate binding for',
      choices: types.map(type => type.name)
    }],
    actions: data => {
      data.camelCaseType = camelcase(data.type)

      return [{
        type: 'add',
        path: path.join(PROJECT_ROOT, 'src/resolvers/{{type}}/{{type}}.subscription.js'),
        templateFile: 'templates/subscription.hbs'
      }]
    }
  })
}
