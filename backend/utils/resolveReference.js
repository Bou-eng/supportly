const mongoose = require('mongoose');

const resolveReference = async (Model, value) => {
  if (!value) {
    return null;
  }

  if (mongoose.isValidObjectId(value)) {
    return value;
  }

  const document = await Model.findOne({ name: value }).select('_id');
  return document ? document._id : null;
};

module.exports = resolveReference;