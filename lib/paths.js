const path = require('path')

const root = process.cwd()

module.exports = {
  PROJECT_ROOT: root,
  RESOLVERS: path.join(root, 'src/resolvers'),
  PERMISSIONS: path.join(root, 'src/permissions'),
  CONTEXT: path.join(root, 'src/context.js'),
  GENERATED: path.join(root, 'generated'),
  PRISMA: path.join(root, 'prisma'),
  NODE_MODULES: path.resolve(__dirname, '../node_modules'),
  PLOPFILE: path.resolve(__dirname, '../plopfile.js')
}
