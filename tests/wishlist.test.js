import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import Wishlist from '../src/models/whishlistModel.js';
import User from '../src/models/userModel.js';
import Book from '../src/models/bookModel.js';
import Author from "../src/models/authorModel.js";
import Genre from "../src/models/genreModel.js";
import { cleanUpDatabase } from './utils.js';

// Nettoyer la base de données avant chaque test
beforeEach(cleanUpDatabase);

describe('Wishlist CRUD operations', () => {
  let userId;
  let bookId;

      beforeEach(async () => {
        cleanUpDatabase();
        // Création d'un utilisateur dans la base de données
        const user = await User.create({
          username: 'newuser',
          email: 'new@example.com',
          password: 'newpassword',
        });
        userId = user.id;
        
            const author = await Author.create({ name: "J.K. Rowling", birth_date: "1965-07-31" });
            const genre = await Genre.create({ name: "Fantasy" });
        // Création d'un livre dans la base de données
        const book = await Book.create({
          title: "Harry Potter à l'école des sorciers",
          author_id: author._id,
          publication_date: "1997-06-26",
          summary: "Un jeune sorcier découvre ses pouvoirs.",
          cover_image: "http://example.com/harry.jpg",
          genres: [genre._id],
        });
        bookId = book._id;
      });

  test('POST /:userId/wishlist - Add a book to user wishlist', async () => {
    const res = await supertest(app)
      .post(`/api/users/${userId}/wishlist`)
      .send({ bookId });

    // Vérifications sur la réponse
    expect(res.status).toBe(201);
    expect(res.get('Content-Type')).toContain('application/json');

    const body = res.body;
    expect(typeof body).toBe('object');
    expect(body).toHaveProperty('_id');
    expect(body.user_id).toBe(userId.toString());
    expect(body.book_id).toBe(bookId.toString());
  });

  test('GET /:userId/wishlist - Get all books in user wishlist', async () => {
    await Wishlist.create({ user_id: userId, book_id: bookId });

    const res = await supertest(app).get(`/api/users/${userId}/wishlist`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0); // Le tableau ne doit pas être vide
  });

  test('DELETE /:userId/wishlist/:bookId - Remove a book from user wishlist', async () => {
    const wishlist = await Wishlist.create({ user_id: userId, book_id: bookId });
    

    const res = await supertest(app).delete(`/api/users/${userId}/wishlist/${bookId}`);

    expect(res.status).toBe(204);
  
    const deletedWishlistItem = await Wishlist.findById(wishlist._id);
    expect(deletedWishlistItem).toBeNull();
  });
});

// Déconnexion de la base de données après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
});
