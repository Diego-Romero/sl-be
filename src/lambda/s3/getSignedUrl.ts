import * as AWS  from 'aws-sdk'
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const bucketName = process.env.TODOS_BUCKET

export function getSignedUrl(id: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: id,
    Expires: 300
  })
}