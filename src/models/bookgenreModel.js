const mongoose = require('mongoose');
// Book_Genre Schema (relationship between Book and Genre)
const bookGenreSchema = new mongoose.Schema({
    book_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    genre_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genre',
      required: true
    }
  }, { timestamps: true });
  
  export const BookGenre = mongoose.model('BookGenre', bookGenreSchema);
