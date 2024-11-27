import BookOfDay from '../models/bookofdayModel.js';

// Ajouter un livre du jour
export async function addBookOfDay(bookId, date) {
  try {
    const bookOfDay = new BookOfDay({ book_id: bookId, date });
    return await bookOfDay.save();
  } catch (err) {
    console.error('Erreur lors de l\'ajout du livre du jour :', err);
    throw err;
  }
}

// Récupérer tous les livres du jour
export async function getBooksOfDay() {
  try {
    return await BookOfDay.find().populate('book_id').sort({ date: -1 });
  } catch (err) {
    console.error('Erreur lors de la récupération des livres du jour :', err);
    throw err;
  }
}

// Ajouter une discussion à un livre du jour
export async function addDiscussionToBookOfDay(bookOfDayId, userId, content) {
  try {
    const bookOfDay = await BookOfDay.findById(bookOfDayId);
    if (!bookOfDay) {
      throw new Error('Book of the Day not found');
    }
    const discussion = { user_id: userId, content };
    bookOfDay.discussions.push(discussion);
    await bookOfDay.save();
    return discussion;
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la discussion :', err);
    throw err;
  }
}

// Récupérer les discussions d'un livre du jour
export async function getDiscussionsByBookOfDay(bookOfDayId) {
  try {
    const bookOfDay = await BookOfDay.findById(bookOfDayId).populate('discussions.user_id');
    if (!bookOfDay) {
      throw new Error('Book of the Day not found');
    }
    return bookOfDay.discussions;
  } catch (err) {
    console.error('Erreur lors de la récupération des discussions :', err);
    throw err;
  }
}
