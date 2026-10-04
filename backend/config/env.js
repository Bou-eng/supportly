const validateEnv = () => {
  const requiredVariables = ['JWT_SECRET', 'MONGO_URI'];
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  const cloudinaryVariables = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const configuredCloudinaryVariables = cloudinaryVariables.filter((name) => process.env[name]);
  if (configuredCloudinaryVariables.length > 0 && configuredCloudinaryVariables.length < cloudinaryVariables.length) {
    throw new Error('Cloudinary configuration requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
  }
};

module.exports = validateEnv;