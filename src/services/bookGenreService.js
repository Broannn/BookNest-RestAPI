import BookGenre from '../models/bookgenreModel.js';

/**
 * Ajoute un genre à un livre donné.
 *
 * @param {String} bookId - L'ID du livre.
 * @param {String} genreId - L'ID du genre.
 * @returns {Promise<Object>} - La relation créée entre le livre et le genre.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function addGenreToBook(bookId, genreId) {
  try {
    const bookGenre = new BookGenre({ book_id: bookId, genre_id: genreId });
    return await bookGenre.save();
  } catch (err) {
    console.error('Erreur lors de l\'ajout d\'un genre au livre :', err);
    throw err;
  }
}

/**
 * Récupère les genres associés à un livre donné.
 *
 * @param {String} bookId - L'ID du livre.
 * @returns {Promise<Array>} - Une liste des genres associés au livre.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function getGenresByBook(bookId) {
  try {
    return await BookGenre.find({ book_id: bookId })
      .populate('genre_id'); // Ajoute les détails des genres à la réponse.
  } catch (err) {
    console.error('Erreur lors de la récupération des genres pour le livre :', err);
    throw err;
  }
}

/**
 * Supprime un genre associé à un livre donné.
 *
 * @param {String} bookId - L'ID du livre.
 * @param {String} genreId - L'ID du genre.
 * @returns {Promise<Object>} - La relation supprimée entre le livre et le genre.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function removeGenreFromBook(bookId, genreId) {
  try {
    return await BookGenre.findOneAndDelete({ book_id: bookId, genre_id: genreId });
  } catch (err) {
    console.error('Erreur lors de la suppression du genre du livre :', err);
    throw err;
  }
}
