import BookOfDay from '../models/bookofdayModel.js';

/**
 * Ajoute un livre comme "Livre du jour".
 *
 * @param {String} bookId - L'ID du livre.
 * @param {Date} date - La date associée au livre du jour.
 * @returns {Promise<Object>} - La relation créée pour le livre du jour.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function addBookOfDay(bookId, date) {
  try {
    const bookOfDay = new BookOfDay({ book_id: bookId, date });
    return await bookOfDay.save();
  } catch (err) {
    console.error('Erreur lors de l\'ajout du livre du jour :', err);
    throw err;
  }
}

/**
 * Récupère tous les livres marqués comme "Livre du jour".
 *
 * @returns {Promise<Array>} - Une liste des livres du jour triés par date décroissante.
 * @throws {Error} - Lance une erreur si l'opération échoue.
 */
export async function getBooksOfDay() {
  try {
    return await BookOfDay.find()
      .populate('book_id') // Ajoute les détails des livres associés.
      .sort({ date: -1 }); // Trie les résultats par date décroissante.
  } catch (err) {
    console.error('Erreur lors de la récupération des livres du jour :', err);
    throw err;
  }
}

/**
 * Ajoute une discussion à un livre marqué comme "Livre du jour".
 *
 * @param {String} bookOfDayId - L'ID du livre du jour.
 * @param {String} userId - L'ID de l'utilisateur qui ajoute la discussion.
 * @param {String} content - Le contenu de la discussion.
 * @returns {Promise<Object>} - La discussion ajoutée.
 * @throws {Error} - Lance une erreur si le livre du jour n'existe pas ou si l'opération échoue.
 */
export async function addDiscussionToBookOfDay(bookOfDayId, userId, content) {
  try {
    const bookOfDay = await BookOfDay.findById(bookOfDayId);
    if (!bookOfDay) {
      throw new Error('Livre du jour introuvable');
    }
    const discussion = { user_id: userId, content };
    bookOfDay.discussions.push(discussion); // Ajoute la discussion à la liste des discussions.
    await bookOfDay.save();
    return discussion;
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la discussion :', err);
    throw err;
  }
}

/**
 * Récupère toutes les discussions associées à un livre marqué comme "Livre du jour".
 *
 * @param {String} bookOfDayId - L'ID du livre du jour.
 * @returns {Promise<Array>} - Une liste des discussions associées au livre du jour.
 * @throws {Error} - Lance une erreur si le livre du jour n'existe pas ou si l'opération échoue.
 */
export async function getDiscussionsByBookOfDay(bookOfDayId) {
  try {
    const bookOfDay = await BookOfDay.findById(bookOfDayId)
      .populate('discussions.user_id'); // Ajoute les détails des utilisateurs à chaque discussion.
    if (!bookOfDay) {
      throw new Error('Livre du jour introuvable');
    }
    return bookOfDay.discussions;
  } catch (err) {
    console.error('Erreur lors de la récupération des discussions :', err);
    throw err;
  }
}
