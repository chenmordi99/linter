const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// this will be our data base's data structure
const DataSchema = new Schema({
  id: Number,
  name: String,
  ammount: Number,
  fields: Array,
  labels: Array,
  types: Array,
});

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model('Form', DataSchema);
