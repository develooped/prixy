
import fs from 'fs'
import path from 'path'

const isDirectory = source => fs.lstatSync(source).isDirectory()

const requireAll = (source) =>
  fs.readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isDirectory)
    .reduce((acc, curr) => {
      const modules = fs.readdirSync(curr)
        .map(name => path.join(curr, name))
        .map(file => {
          if (isDirectory(file)) {
            return [...acc, requireAll(file)]
          }
          return require(file)
        })
      return [...acc, ...modules]
    }, [])

export default requireAll
