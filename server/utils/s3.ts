import { S3Client } from '@aws-sdk/client-s3'
import type { S3Config } from '~~/types'

export function createS3Client(s3Config: S3Config): S3Client {
  return new S3Client({
    endpoint: s3Config.endpoint,
    region: s3Config.region || 'auto',
    maxAttempts: 3,
    forcePathStyle: true,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  })
}
