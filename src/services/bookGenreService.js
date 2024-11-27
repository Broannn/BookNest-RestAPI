import BookGenre from '../models/bookgenreModel.js';

// Ajouter un genre à un livre
export async function addGenreToBook(bookId, genreId) {
  try {
    const bookGenre = new BookGenre({ book_id: bookId, genre_id: genreId });
    return await bookGenre.save();
  } catch (err) {
    console.error('Erreur lors de l\'ajout d\'un genre au livre :', err);
    throw err;
  }
}

// Récupérer les genres associés à un livre
export async function getGenresByBook(bookId) {
  try {
    return await BookGenre.find({ book_id: bookId }).populate('genre_id');
  } catch (err) {
    console.error('Erreur lors de la récupération des genres pour le livre :', err);
    throw err;
  }
}

// Supprimer un genre d'un livre
export async function removeGenreFromBook(bookId, genreId) {
  try {
    return await BookGenre.findOneAndDelete({ book_id: bookId, genre_id: genreId });
  } catch (err) {
    console.error('Erreur lors de la suppression du genre du livre :', err);
    throw err;
  }
}
