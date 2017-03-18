const AWS = require('aws-sdk');
const fs = require('fs');
const denodeify = require('denodeify');

const readFile = denodeify(fs.readFile);

const getFilename = (runId, name, ext) => `${[runId, name].join('/')}.${ext}`;

const uploadRun = (runId, stages, edges) => {
  const bucket = new AWS.S3({ params: { Bucket: 'dockercise' } });

  const params = {
    Key: getFilename(runId, 'index', 'json'),
    Body: new Buffer(JSON.stringify({ stages, edges }), 'utf8'),
    ContentEncoding: 'utf8',
    ContentType: 'application/json',
    ACL: 'public-read',
  };

  return bucket.upload(params).promise();
};

const uploadLogs = (runId, name, file) => {
  const bucket = new AWS.S3({ params: { Bucket: 'dockercise' } });

  const params = (Body) => ({
    Key: getFilename(runId, name, 'log'),
    Body,
    ContentEncoding: 'utf8',
    ContentType: 'application/json',
    ACL: 'public-read',
  });

  return readFile(file, 'utf8')
    .then((contents) => bucket.upload(params(contents)).promise());
};


const uploadResults = (runId, name, results) => {
  const bucket = new AWS.S3({ params: { Bucket: 'dockercise' } });

  const params = {
    Key: getFilename(runId, name, 'json'),
    Body: new Buffer(JSON.stringify(results), 'utf8'),
    ContentEncoding: 'utf8',
    ContentType: 'application/json',
    ACL: 'public-read',
  };

  return bucket.upload(params).promise();
};

module.exports = { uploadRun, uploadResults, uploadLogs };