import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js'; // Assurez-vous que le chemin est correct
import Author from '../src/models/authorModel.js';
import { cleanUpDatabase } from './utils.js';
import { baseUrl } from '../config.js';

// Nettoyage de la base de données avant chaque test
beforeEach(cleanUpDatabase);

// Test pour créer un auteur avec un champ birth_date
test('POST /api/authors - Création d\'un auteur avec birth_date', async () => {
  const res = await supertest(app).post('/api/authors').send({
    name: 'Victor Hugo',
    birth_date: '1802-02-26',
  });

  expect(res.status).toBe(201);
  expect(res.get('Content-Type')).toContain('application/json');

  const body = res.body;
  expect(typeof body).toBe('object');
  expect(body.name).toBe('Victor Hugo');
  expect(body.birth_date).toBe('1802-02-26T00:00:00.000Z'); // Vérifiez la conversion ISO

  expect(res.get('Location')).toEqual(`${baseUrl}/api/authors/${body._id}`);
});

// Test pour lire tous les auteurs avec le champ birth_date
test('GET /api/authors - Liste des auteurs avec birth_date', async () => {
    const author = await Author.create([
    { name: 'Jules Verne', birth_date: '1828-02-08' },
    { name: 'George Sand', birth_date: '1804-07-01' },
  ]);

  const res = await supertest(app).get('/api/authors');

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBe(2);

  const authors = res.body;
  const verne = authors.find((a) => a.name === 'Jules Verne');
  const sand = authors.find((a) => a.name === 'George Sand');

  expect(verne).toBeDefined();
  expect(verne.birth_date).toBe('1828-02-08T00:00:00.000Z');

  expect(sand).toBeDefined();
  expect(sand.birth_date).toBe('1804-07-01T00:00:00.000Z');
});

// Test pour récupérer un auteur par ID avec birth_date
test('GET /api/authors/:id - Récupérer un auteur avec birth_date', async () => {
  const author = await Author.create({ name: 'Emile Zola', birth_date: '1840-04-02' });

  const res = await supertest(app).get(`/api/authors/${author.id}`);

  expect(res.status).toBe(200);
  expect(res.body.name).toBe('Emile Zola');
  expect(res.body.birth_date).toBe('1840-04-02T00:00:00.000Z');
});

// Test pour mettre à jour un auteur (ajout/modification de birth_date)
test('PUT /api/authors/:id - Mettre à jour un auteur avec birth_date', async () => {
  const author = await Author.create({ name: 'Marcel Proust', birth_date: '1871-07-10' });

  const res = await supertest(app)
    .put(`/api/authors/${author._id}`)
    .send({ birth_date: '1871-07-11' });

  expect(res.status).toBe(200);
  expect(res.body.name).toBe('Marcel Proust');
  expect(res.body.birth_date).toBe('1871-07-11T00:00:00.000Z');
});

// Test pour supprimer un auteur
test('DELETE /api/authors/:id - Supprimer un auteur', async () => {
  const author = await Author.create({ name: 'Albert Camus', birth_date: '1913-11-07' });

  const res = await supertest(app).delete(`/api/authors/${author._id}`);

  expect(res.status).toBe(204);

  const deletedAuthor = await Author.findById(author._id);
  expect(deletedAuthor).toBeNull();
});

// Déconnexion de la base de données après les tests
afterAll(mongoose.disconnect);
