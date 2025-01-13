import Favorite from '../models/favoriteModel.js';

/**
 * Ajoute un livre aux favoris d'un utilisateur.
 *
 * @param {String} userId - L'ID de l'utilisateur.
 * @param {String} bookId - L'ID du livre à ajouter aux favoris.
 * @returns {Promise<Object>} - La relation créée entre l'utilisateur et le livre.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function markBookAsFavorite(userId, bookId) {
  try {
    const favorite = new Favorite({ user_id: userId, book_id: bookId });
    return await favorite.save();
  } catch (err) {
    console.error('Erreur lors de l\'ajout aux favoris :', err);
    throw err;
  }
}

/**
 * Récupère tous les livres marqués comme favoris par un utilisateur donné.
 *
 * @param {String} userId - L'ID de l'utilisateur.
 * @returns {Promise<Array>} - Une liste des livres favoris de l'utilisateur.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function getFavoriteBooksByUser(userId) {
  try {
    return await Favorite.find({ user_id: userId })
      .populate('book_id'); // Ajoute les détails des livres à la réponse.
  } catch (err) {
    console.error('Erreur lors de la récupération des favoris :', err);
    throw err;
  }
}
