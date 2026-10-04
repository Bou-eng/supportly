const multer = require('multer');

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/csv',
]);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.csv']);

const hasValidSignature = (file) => {
  const bytes = file.buffer;
  if (file.mimetype === 'application/pdf') return bytes.subarray(0, 4).toString() === '%PDF';
  if (file.mimetype === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (file.mimetype === 'image/jpeg') return bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
  if (file.mimetype === 'image/gif') return ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString());
  return file.mimetype === 'text/plain' || file.mimetype === 'text/csv';
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (req, file, callback) => {
    const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
      return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }
    return callback(null, true);
  },
});

module.exports = { upload, hasValidSignature, MAX_FILE_SIZE, MAX_FILES };