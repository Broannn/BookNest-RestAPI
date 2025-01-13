import Critique from '../models/critiqueModel.js';

/**
 * Ajoute une critique pour un livre.
 *
 * @param {String} userId - L'ID de l'utilisateur.
 * @param {String} bookId - L'ID du livre.
 * @param {Number} rating - La note attribuée au livre.
 * @param {String} comment - Le commentaire de l'utilisateur.
 * @returns {Promise<Object>} - La critique ajoutée.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function addCritique(userId, bookId, rating, comment) {
  try {
    const critique = new Critique({
      user_id: userId,
      book_id: bookId,
      rating,
      comment,
    });

    return await critique.save();
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la critique :', err);
    throw err;
  }
}

/**
 * Récupère toutes les critiques associées à un livre.
 *
 * @param {String} bookId - L'ID du livre.
 * @returns {Promise<Array>} - Une liste des critiques du livre.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function getCritiquesByBook(bookId) {
  try {
    return await Critique.find({ book_id: bookId })
      .populate('user_id', 'username'); // Ajoute les informations de l'utilisateur (ex. nom d'utilisateur) à chaque critique.
  } catch (err) {
    console.error('Erreur lors de la récupération des critiques du livre :', err);
    throw err;
  }
}

/**
 * Récupère une critique spécifique d'un utilisateur pour un livre donné.
 *
 * @param {String} userId - L'ID de l'utilisateur.
 * @param {String} bookId - L'ID du livre.
 * @returns {Promise<Object|null>} - La critique correspondante, ou null si aucune n'est trouvée.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function getCritiqueByUserAndBook(userId, bookId) {
  try {
    return await Critique.findOne({ user_id: userId, book_id: bookId });
  } catch (err) {
    console.error('Erreur lors de la récupération de la critique de l\'utilisateur :', err);
    throw err;
  }
}

/**
 * Met à jour une critique existante.
 *
 * @param {String} critiqueId - L'ID de la critique à mettre à jour.
 * @param {Number} rating - La nouvelle note attribuée au livre.
 * @param {String} comment - Le nouveau commentaire.
 * @returns {Promise<Object>} - La critique mise à jour.
 * @throws {Error} - Lance une erreur si la critique n'existe pas ou si l'opération échoue.
 */
export async function updateCritique(critiqueId, rating, comment) {
  try {
    const critique = await Critique.findById(critiqueId);
    if (!critique) {
      throw new Error('Critique introuvable');
    }

    critique.rating = rating;
    critique.comment = comment;
    return await critique.save();
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la critique :', err);
    throw err;
  }
}

/**
 * Supprime une critique existante.
 *
 * @param {String} critiqueId - L'ID de la critique à supprimer.
 * @returns {Promise<void>} - Aucune valeur retournée si la suppression est réussie.
 * @throws {Error} - Lance une erreur si la critique n'existe pas ou si l'opération échoue.
 */
export async function deleteCritique(critiqueId) {
  try {
    const critique = await Critique.findById(critiqueId);
    if (!critique) {
      throw new Error('Critique introuvable');
    }

    await critique.remove();
  } catch (err) {
    console.error('Erreur lors de la suppression de la critique :', err);
    throw err;
  }
}
