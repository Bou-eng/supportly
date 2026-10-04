const { cloudinary, isConfigured } = require('../config/cloudinary');

const uploadToCloudinary = (file, folder) => new Promise((resolve, reject) => {
  if (!isConfigured) {
    reject(new Error('Cloudinary storage is not configured'));
    return;
  }

  const stream = cloudinary.uploader.upload_stream({
    folder,
    resource_type: 'auto',
    use_filename: true,
    unique_filename: true,
    type: 'upload',
  }, (error, result) => error ? reject(error) : resolve(result));

  stream.end(file.buffer);
});

module.exports = uploadToCloudinary;