import { scalarType } from 'nexus'
import { GraphQLUpload } from 'graphql-upload'
import env from '../env'
import s3Upload from './upload/s3UploadProcessor'

let uploadProcessor = env.AWS_SECRETACCESSKEY ? s3Upload : () => () => {
  throw new Error('Cannot handle upload. AWS credentials missing from .env')
}

export const Upload = scalarType({
  name: GraphQLUpload.name,
  asNexusMethod: 'upload', // We set this to be used as a method later as `t.upload()` if needed
  description: GraphQLUpload.description,
  serialize: GraphQLUpload.serialize,
  parseValue: uploadProcessor(GraphQLUpload.parseValue),
  parseLiteral: GraphQLUpload.parseLiteral
})
