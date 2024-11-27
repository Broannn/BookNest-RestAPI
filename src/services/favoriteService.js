import Favorite from '../models/favoriteModel.js';

// Ajouter un livre aux favoris
export async function markBookAsFavorite(userId, bookId) {
  try {
    const favorite = new Favorite({ user_id: userId, book_id: bookId });
    return await favorite.save();
  } catch (err) {
    console.error('Erreur lors de l\'ajout aux favoris :', err);
    throw err;
  }
}

// Récupérer les livres favoris d'un utilisateur
export async function getFavoriteBooksByUser(userId) {
  try {
    return await Favorite.find({ user_id: userId }).populate('book_id');
  } catch (err) {
    console.error('Erreur lors de la récupération des favoris :', err);
    throw err;
  }
}
