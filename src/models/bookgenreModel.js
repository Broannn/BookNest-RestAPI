import mongoose from 'mongoose';
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
  
  export default mongoose.model('BookGenre', bookGenreSchema);
