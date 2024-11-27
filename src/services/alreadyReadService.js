import AlreadyRead from '../models/alreadyreadModel.js';

export async function markBookAsRead(userId, bookId) {
  try {
    const alreadyRead = new AlreadyRead({ user_id: userId, book_id: bookId });
    return await alreadyRead.save();
  } catch (err) {
    console.error('Erreur lors de la création de la relation :', err);
    throw err;
  }
}
export async function getBooksReadByUser(userId) {
    try {
      return await AlreadyRead.find({ user_id: userId })
        .populate('book_id')
        .populate('user_id');
    } catch (err) {
      console.error('Erreur lors de la récupération des livres :', err);
      throw err;
    }
  }
  export async function getUsersWhoReadBook(bookId) {
    try {
      return await AlreadyRead.find({ book_id: bookId })
        .populate('user_id')
        .populate('book_id');
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs :', err);
      throw err;
    }
  }
  