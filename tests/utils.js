import User from '../src/models/userModel.js';
import Book from '../src/models/bookModel.js';
import Genre from '../src/models/genreModel.js';
import Favorite from '../src/models/favoriteModel.js';
import Wishlist from '../src/models/whishlistModel.js';
import AlreadyRead from '../src/models/alreadyreadModel.js';

export async function cleanUpDatabase() {
  await Promise.all([
    User.deleteMany().exec(),
    Book.deleteMany().exec(),
    Genre.deleteMany().exec(),
    Favorite.deleteMany().exec(),
    Wishlist.deleteMany().exec(),
    AlreadyRead.deleteMany().exec(),
  ]);
}
