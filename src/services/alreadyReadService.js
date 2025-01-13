import AlreadyRead from '../models/alreadyreadModel.js';
import mongoose from 'mongoose';

/**
 * Marque un livre comme lu pour un utilisateur donné.
 *
 * @param {String} userId - L'ID de l'utilisateur.
 * @param {String} bookId - L'ID du livre.
 * @returns {Promise<Object>} - La relation créée entre l'utilisateur et le livre.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function markBookAsRead(userId, bookId) {
  try {
    const alreadyRead = new AlreadyRead({ user_id: userId, book_id: bookId });
    return await alreadyRead.save();
  } catch (err) {
    console.error('Erreur lors de la création de la relation :', err);
    throw err;
  }
}

/**
 * Récupère tous les livres marqués comme lus par un utilisateur donné.
 *
 * @param {String} userId - L'ID de l'utilisateur.
 * @returns {Promise<Array>} - Une liste des livres lus par l'utilisateur.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function getBooksReadByUser(userId) {
  try {
    return await AlreadyRead.find({ user_id: userId })
      .populate('book_id') // Ajoute les détails des livres à la réponse.
      .populate('user_id'); // Ajoute les détails de l'utilisateur à la réponse.
  } catch (err) {
    console.error('Erreur lors de la récupération des livres :', err);
    throw err;
  }
}

/**
 * Récupère tous les utilisateurs qui ont lu un livre donné.
 *
 * @param {String} bookId - L'ID du livre.
 * @returns {Promise<Array>} - Une liste des utilisateurs ayant lu le livre.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function getUsersWhoReadBook(bookId) {
  try {
    return await AlreadyRead.find({ book_id: bookId })
      .populate('user_id') // Ajoute les détails des utilisateurs à la réponse.
      .populate('book_id'); // Ajoute les détails du livre à la réponse.
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs :', err);
    throw err;
  }
}

/**
 * Supprime un livre de la liste des livres lus par un utilisateur donné.
 *
 * @param {String} userId - L'ID de l'utilisateur.
 * @param {String} bookId - L'ID du livre.
 * @returns {Promise<Object>} - La relation supprimée entre l'utilisateur et le livre.
 * @throws {Error} - Lance une erreur si l'opération échoue ou si les IDs sont invalides.
 */
export async function removeBookFromReadList(userId, bookId) {
  try {
    // Vérifie que les IDs fournis sont valides.
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(bookId)) {
      throw new Error('Invalid userId or bookId');
    }

    // Supprime la relation entre l'utilisateur et le livre.
    const result = await AlreadyRead.findOneAndDelete({ user_id: userId, book_id: bookId });

    // Vérifie si une relation a été trouvée et supprimée.
    if (!result) {
      throw new Error('Relation not found');
    }

    return result;
  } catch (err) {
    console.error('Erreur lors de la suppression du livre de la liste :', err);
    throw err;
  }
}
