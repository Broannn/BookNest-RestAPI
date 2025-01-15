import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import Book from "../src/models/bookModel.js";
import Author from "../src/models/authorModel.js";
import Genre from "../src/models/genreModel.js";
import User from "../src/models/userModel.js"; // Ajout pour l'authentification
import { cleanUpDatabase } from "./utils.js";
import { baseUrl } from "../config.js";

// Nettoyage de la base de données avant chaque test
beforeEach(cleanUpDatabase);

let author, genre, genre2;

// Crée un auteur, un genre et un utilisateur avec un token JWT avant les tests
beforeEach(async () => {
    cleanUpDatabase();
    author = await Author.create({ name: "J.K. Rowling", birth_date: "1965-07-31" });
    genre = await Genre.create({ name: "Fantasy" });
    genre2 = await Genre.create({ name: "Horror" });
  });
  

// Test pour créer un livre (POST)
test("POST /api/books - Création d'un livre", async () => {
    const bookData = {
      title: "Harry Potter à l'école des sorciers",
      author_id: author._id,
      publication_date: "1997-06-26",
      summary: "Un jeune sorcier découvre ses pouvoirs.",
      cover_image: "http://example.com/harry.jpg",
      genres: [genre._id],
    };
  
    const res = await supertest(app)
      .post("/api/books")
      .send(bookData);
  
    // Vérifications
    expect(res.status).toBe(201);
    expect(res.body.title).toBe(bookData.title);
    expect(res.body.author_id).toBe(bookData.author_id.toString());
    expect(res.body.publication_date).toBe("1997-06-26T00:00:00.000Z");
    expect(res.body.summary).toBe(bookData.summary);
    expect(res.body.cover_image).toBe(bookData.cover_image);
    expect(res.body.genres).toContain(genre._id.toString());
  });
  
  // Test pour lire tous les livres (GET avec pagination)
  test("GET /api/books - Liste des livres avec pagination", async () => {
    await Book.create([
      {
        title: "Livre 1",
        author_id: author._id,
        publication_date: "1997-06-26",
        summary: "Un jeune sorcier découvre ses pouvoirs.",
        cover_image: "http://example.com/harry.jpg",
        genres: [genre._id],
      },
      {
        title: "Livre 2",
        author_id: author._id,
        publication_date: "1997-06-26",
        summary: "Un jeune sorcier découvre ses pouvoirs.",
        cover_image: "http://example.com/harry.jpg",
        genres: [genre._id],
      },
    ]);
  
    const booksInDb = await Book.find();  
    const res = await supertest(app).get("/api/books?page=1&limit=1");
  
    // Vérifications
    expect(res.status).toBe(200);
    expect(res.body.books.length).toBe(1); // Limite de 1 livre par page
    expect(res.body.meta.total).toBe(2); // Total des livres
    expect(res.body.meta.page).toBe(1); // Page actuelle
  });
  
  
  test("GET /api/books/:id - Récupérer un livre spécifique", async () => {
    const book = await Book.create({
        title: "Ancien Titre",
        author_id: author._id,
        publication_date: "2000-01-01",
        summary: "Ancien résumé",
        cover_image: "http://example.com/old_image.jpg",
        genres: [genre._id],
    });
  
    const res = await supertest(app).get(`/api/books/${book._id.toString()}`);
  
    // Vérifications
    expect(res.status).toBe(200);
    expect(res.body.title).toBe(book.title);
    expect(res.body.publication_date).toBe("2000-01-01T00:00:00.000Z");
    expect(res.body.summary).toBe(book.summary);
    expect(res.body.cover_image).toBe(book.cover_image);
  });
  
  

  // Test pour mettre à jour un livre (PUT)
test("PUT /api/books/:id - Mettre à jour un livre avec succès", async () => {
    const book = await Book.create({
      title: "Ancien Titre",
      author_id: author._id,
      publication_date: "2000-01-01",
      summary: "Ancien résumé",
      cover_image: "http://example.com/old_image.jpg",
      genres: [genre._id],
    });
  
    const updatedData = {
      title: "Nouveau Titre",
      summary: "Nouveau résumé",
      publication_date: "2001-01-01",
      cover_image: "http://example.com/new_image.jpg",
      genres: [genre._id, genre2._id], // Genres mis à jour
    };
  
    const res = await supertest(app)
      .put(`/api/books/${book._id}`)
      .send(updatedData);
  

    // Vérifications
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Nouveau Titre");
    expect(res.body.summary).toBe("Nouveau résumé");
    expect(res.body.publication_date).toBe("2001-01-01T00:00:00.000Z");
    expect(res.body.cover_image).toBe("http://example.com/new_image.jpg");
  // Vérifie que tous les genres mis à jour sont présents
  expect(res.body.genres).toEqual(
    expect.arrayContaining([
      genre._id.toString(),
      genre2._id.toString(),
    ])
  );  });
  
  // Test pour supprimer un livre (DELETE)
  test("DELETE /api/books/:id - Supprimer un livre avec succès", async () => {
    const book = await Book.create({
      title: "Livre à supprimer",
      author_id: author._id,
      publication_date: "2010-01-01",
      summary: "Résumé pour la suppression",
      genres: [genre._id],
    });
  
    const res = await supertest(app)
      .delete(`/api/books/${book._id}`)
  
    // Vérifications
    expect(res.status).toBe(204);
  
    const deletedBook = await Book.findById(book._id);
    expect(deletedBook).toBeNull(); // Vérifiez que le livre a bien été supprimé
  });
  
// Déconnexion de la base de données après tous les tests
afterAll(mongoose.disconnect);
