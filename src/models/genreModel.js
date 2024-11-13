const mongoose = require('mongoose');

// Genre Schema
const genreSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250
    }
  }, { timestamps: true });
  
  export const Genre = mongoose.model('Genre', genreSchema);