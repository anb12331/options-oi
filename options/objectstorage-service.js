const IBM = require('ibm-cos-sdk');
const fs = require('fs')

module.exports = {
	createBucket: createBucket, 
	getBuckets: getBuckets, uploadFile: uploadFile,
	getItem: getItem, getBucketContents: getBucketContents}

var config = {
	accessKeyId: 'dabc6d5c6a3349229374b7e53b40a091',
	secretAccessKey: 'd4233f2743a095f7a5d978e1f3b87bcbab327b52f1c28930',
    endpoint: "s3.us.cloud-object-storage.appdomain.cloud",
    apiKeyId: 'F-F83a6cQ0GCp5PdVuBJTo32UNM3S5-gphxiHl2bNgvk',
    serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/e6529574685f493a8076bc0c5a8bf467:9ec5a1d5-98df-4c8e-aac2-83bd25b11b3f::'
};


var cos = new IBM.S3(config);

function createBucket(bucketName) {
    console.log(`Creating new bucket: ${bucketName}`);
    return cos.createBucket({
        Bucket: bucketName        
        ,
        CreateBucketConfiguration: {
          LocationConstraint: 'us-standard'
        }        
    }).promise()
    .then((() => {
        console.log(`Bucket: ${bucketName} created!`);
    }))
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}

function getBuckets() {
    console.log('Retrieving list of buckets');
    return cos.listBuckets().promise();
}

function uploadFile(filename, path, callback) {
	fs.readFile(path, (e, fileData) => {

		console.log('Upload file with name, size:', filename, fileData.length)

		var params = {Bucket: 'backup202103161144', Key: filename, Body: fileData};
		cos.upload(params, function(err, data) {
		  console.log(err, data);
          if(callback) callback(err, data);
		});
	});
}

function getItem(bucketName, itemName) {
    console.log(`Retrieving item from bucket: ${bucketName}, key: ${itemName}`);
    return cos.getObject({
        Bucket: bucketName, 
        Key: itemName
    }).promise()
    .then((data) => {
        if (data != null) {
            let path = `./dump/${itemName}-${new Date().getTime()}`
        	fs.writeFile(path, data.Body, function(err) {
                console.log('File Written to: ' + path);    
            })
            
        }    
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}

function getBucketContents(bucketName) {
    console.log(`Retrieving bucket contents from: ${bucketName}`);
    return cos.listObjects(
        {Bucket: bucketName},
    ).promise()    
}