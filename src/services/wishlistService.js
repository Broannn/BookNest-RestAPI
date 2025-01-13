import Wishlist from '../models/whishlistModel.js';

/**
 * Ajoute un livre à la wishlist d'un utilisateur.
 *
 * @param {String} userId - L'ID de l'utilisateur.
 * @param {String} bookId - L'ID du livre à ajouter à la wishlist.
 * @returns {Promise<Object>} - L'élément ajouté à la wishlist.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function addBookToWishlist(userId, bookId) {
  try {
    const wishlistItem = new Wishlist({ user_id: userId, book_id: bookId });
    return await wishlistItem.save();
  } catch (err) {
    console.error('Erreur lors de l\'ajout à la wishlist :', err);
    throw err;
  }
}

/**
 * Récupère tous les livres dans la wishlist d'un utilisateur.
 *
 * @param {String} userId - L'ID de l'utilisateur.
 * @returns {Promise<Array>} - Une liste des livres dans la wishlist de l'utilisateur.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function getWishlistBooksByUser(userId) {
  try {
    return await Wishlist.find({ user_id: userId })
      .populate('book_id'); // Ajoute les détails des livres à la réponse.
  } catch (err) {
    console.error('Erreur lors de la récupération de la wishlist :', err);
    throw err;
  }
}

/**
 * Supprime un livre de la wishlist d'un utilisateur.
 *
 * @param {String} userId - L'ID de l'utilisateur.
 * @param {String} bookId - L'ID du livre à supprimer de la wishlist.
 * @returns {Promise<Object|null>} - L'élément supprimé de la wishlist, ou null s'il n'a pas été trouvé.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function removeBookFromWishlist(userId, bookId) {
  try {
    return await Wishlist.findOneAndDelete({ user_id: userId, book_id: bookId });
  } catch (err) {
    console.error('Erreur lors de la suppression de la wishlist :', err);
    throw err;
  }
}
