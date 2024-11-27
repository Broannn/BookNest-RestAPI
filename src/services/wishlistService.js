import Wishlist from '../models/whishlistModel.js';

// Ajouter un livre à la wishlist
export async function addBookToWishlist(userId, bookId) {
  try {
    const wishlistItem = new Wishlist({ user_id: userId, book_id: bookId });
    return await wishlistItem.save();
  } catch (err) {
    console.error('Erreur lors de l\'ajout à la wishlist :', err);
    throw err;
  }
}

// Récupérer les livres dans la wishlist d'un utilisateur
export async function getWishlistBooksByUser(userId) {
  try {
    return await Wishlist.find({ user_id: userId }).populate('book_id');
  } catch (err) {
    console.error('Erreur lors de la récupération de la wishlist :', err);
    throw err;
  }
}

// Supprimer un livre de la wishlist d'un utilisateur
export async function removeBookFromWishlist(userId, bookId) {
  try {
    return await Wishlist.findOneAndDelete({ user_id: userId, book_id: bookId });
  } catch (err) {
    console.error('Erreur lors de la suppression de la wishlist :', err);
    throw err;
  }
}
