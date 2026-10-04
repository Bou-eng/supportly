process.env.NODE_ENV = 'test';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const { cloudinary } = require('../config/cloudinary');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

test('uploads a buffer through Cloudinary and returns resource metadata', async () => {
  const original = cloudinary.uploader.upload_stream;
  cloudinary.uploader.upload_stream = (options, callback) => {
    assert.equal(options.folder, 'supportly/tickets/test-ticket');
    assert.equal(options.resource_type, 'auto');
    return {
      end: (buffer) => {
        assert.equal(buffer.toString(), 'attachment');
        callback(null, { public_id: 'supportly/tickets/test-ticket/file', resource_type: 'raw', format: 'txt', bytes: buffer.length });
      },
    };
  };

  try {
    const result = await uploadToCloudinary({ buffer: Buffer.from('attachment') }, 'supportly/tickets/test-ticket');
    assert.deepEqual(result, { public_id: 'supportly/tickets/test-ticket/file', resource_type: 'raw', format: 'txt', bytes: 10 });
  } finally {
    cloudinary.uploader.upload_stream = original;
  }
});
