const mongoose = require('mongoose');

// AlreadyRead Schema
const alreadyReadSchema = new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    book_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    }
  }, { timestamps: true });
  
  export const AlreadyRead = mongoose.model('AlreadyRead', alreadyReadSchema);