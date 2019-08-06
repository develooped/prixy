import AWS from 'aws-sdk'
import uuid from 'uuid/v4'

import env from '../../env'

AWS.config.update({
  secretAccessKey: env.AWS_SECRETACCESSKEY,
  accessKeyId: env.AWS_ACCESSKEYID,
  region: env.AWS_REGION
})

const s3 = new AWS.S3({ params: { Bucket: env.AWS_BUCKET } })

export default function saveToAWS (promise) {
  return async (...args) => {
    let file = await promise(...args)

    // It must be an url
    if (typeof file === 'string') {
      return file
    }

    if (file.rawFile) {
      file = await file.rawFile
    }

    const { filename, createReadStream, mimetype } = file

    const key = uuid()
    const extension = filename.split('.').reverse()[0]
    const s3fileName = `${key}.${extension}`
    const stream = createReadStream()

    try {
      const uploadResult = await s3.upload({
        Body: stream,
        Key: s3fileName,
        ACL: 'public-read',
        ContentType: mimetype
      }).promise()

      return uploadResult.Location
    } catch (err) {
      console.error(err)

      throw err
    } finally {
      stream.destroy()
    }
  }
}
