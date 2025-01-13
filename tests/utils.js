import User from '../src/models/userModel.js';
import Book from '../src/models/bookModel.js';
import Genre from '../src/models/genreModel.js';
import Author from '../src/models/authorModel.js';
import Favorite from '../src/models/favoriteModel.js';
import Wishlist from '../src/models/whishlistModel.js';
import AlreadyRead from '../src/models/alreadyreadModel.js';

export async function cleanUpDatabase() {
  try {
    await Promise.all([
      User.deleteMany(),
      Book.deleteMany(),
      Author.deleteMany(),
      Genre.deleteMany(),
      Favorite.deleteMany(),
      Wishlist.deleteMany(),
      AlreadyRead.deleteMany(),
    ]);
  } catch (err) {
    console.error('Erreur lors du nettoyage de la base de données:', err);
    throw err; // Laisser échouer le test si le nettoyage échoue
  }
}