const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// this will be our data base's data structure
const DataSchema = new Schema({
  form_id: { type: Number },
  results: { type: Array },
});

// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model('Sub', DataSchema);
