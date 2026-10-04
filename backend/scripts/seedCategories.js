const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Category = require('../models/Category');
const categoryDefinitions = require('../constants/categoryDefinitions');

const seedCategories = async () => {
  await mongoose.connect(process.env.MONGO_URI, { family: 4, serverSelectionTimeoutMS: 10000 });

  for (const definition of categoryDefinitions) {
    await Category.findOneAndUpdate(
      { name: definition.name },
      { $setOnInsert: definition },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }

  console.log(`Categories ready: ${categoryDefinitions.length}`);
  await mongoose.disconnect();
};

seedCategories().catch(async (error) => {
  console.error(`Category seed failed: ${error.message}`);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});