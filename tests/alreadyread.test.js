import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import AlreadyRead from '../src/models/alreadyreadModel.js';
import User from '../src/models/userModel.js';
import Book from '../src/models/bookModel.js';
import Author from "../src/models/authorModel.js";
import Genre from "../src/models/genreModel.js";
import { cleanUpDatabase } from './utils.js';

// Nettoyer la base de données avant chaque test
beforeEach(cleanUpDatabase);

describe('Already Read by User', () => {
    let userId;
    let bookId;
    cleanUpDatabase();
  
    beforeEach(async () => {
      // Création d'un utilisateur dans la base de données
      const user = await User.create({
        username: 'newuser1',
        email: 'new1@example.com',
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

  test('POST users/:userId/already-read - Add a book as already read by user', async () => {
    const res = await supertest(app)
      .post(`/api/users/${userId}/already-read`)
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

  test('GET users/:userId/already-read - Get all books read by user', async () => {
    // Étape 1 : Ajouter un livre marqué comme lu via POST
    const postRes = await supertest(app)
      .post(`/api/users/${userId}/already-read`)
      .send({ bookId });
    
  
    expect(postRes.status).toBe(201); // Vérifie que la création renvoie un statut 201
    expect(postRes.get('Content-Type')).toContain('application/json');
    expect(postRes.body).toHaveProperty('_id');
  
    // Étape 2 : Récupérer les livres marqués comme lus via GET
    const getRes = await supertest(app).get(`/api/users/${userId}/already-read`);
    
  
    expect(getRes.status).toBe(200); // Vérifie que la récupération renvoie un statut 200
    expect(getRes.get('Content-Type')).toContain('application/json');
  
    const body = getRes.body;
    
    // Vérification du format des données
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  
    // Vérifie les détails du premier élément
    const record = body[0];
    expect(record.user_id.id).toBe(userId.toString());
    expect(record.book_id._id).toBe(bookId.toString());
  });


  test('DELETE /:userId/already-read/:bookId - Remove a book from the read list', async () => {
    // Étape 1 : Ajouter un livre marqué comme lu via POST
    const postRes = await supertest(app)
      .post(`/api/users/${userId}/already-read/`)
      .send({ bookId });
    
  
    expect(postRes.status).toBe(201);
    expect(postRes.body).toHaveProperty('_id');
  
    // Étape 2 : Supprimer le livre marqué comme lu via DELETE
    const deleteRes = await supertest(app)
      .delete(`/api/users/${userId}/already-read/${bookId}`);
  
  
    expect(deleteRes.status).toBe(200); // Vérifie que la suppression renvoie un statut 200
    expect(deleteRes.get('Content-Type')).toContain('application/json');
    expect(deleteRes.body).toHaveProperty('message', 'Book successfully removed from read list');
  
    // Étape 3 : Vérifier que le livre a été supprimé via GET
    const getRes = await supertest(app).get(`/api/users/${userId}/already-read`);
    
  
    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
    expect(getRes.body.length).toBe(0); // Vérifie que la liste est vide
  });
  
});

// Déconnexion de la base de données après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
});
