import * as AWS  from 'aws-sdk'
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});
const bucketName = process.env.LISTS_BUCKET

export function getSignedUrl(itemId: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: itemId,
    Expires: 300
  })
}