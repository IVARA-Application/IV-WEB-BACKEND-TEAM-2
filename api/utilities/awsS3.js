const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  signatureVersion: "v4",
  region: "ap-south-1",
  credentials: new AWS.Credentials({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  }),
});

const getSignedUrl = (objectName) => {
  s3.headObject(objectName);
  return s3.getSignedUrl("getObject", {
    Bucket: process.env.BUCKET_NAME,
    Key: objectName,
  });
};

module.exports = { getSignedUrl };
