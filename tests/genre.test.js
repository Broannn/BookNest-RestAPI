import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import Genre from '../src/models/genreModel.js';
import { cleanUpDatabase } from './utils.js';

// Nettoyer la base de données avant chaque test
beforeEach(cleanUpDatabase);

describe('Genre CRUD operations', () => {
    cleanUpDatabase();
  test('POST /api/genres - Create a genre', async () => {
    const res = await supertest(app).post('/api/genres').send({
      name: 'Fantasy',
    });

    // Vérifications sur la réponse
    expect(res.status).toBe(201);
    expect(res.get('Content-Type')).toContain('application/json');

    const body = res.body;
    expect(typeof body).toBe('object');
    expect(body.name).toBe('Fantasy');
    expect(typeof body._id).toBe('string');
  });

  test('GET /api/genres - Read all genres', async () => {
    // Créez plusieurs genres avant le test
    await Promise.all([
      Genre.create({ name: 'Science Fiction' }),
      Genre.create({ name: 'Romance' }),
    ]);

    const res = await supertest(app).get('/api/genres');

    // Vérifications sur la réponse
    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('application/json');

    const body = res.body;
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);

    // Vérifiez que les genres créés existent dans la réponse
    const genre1 = body.find((genre) => genre.name === 'Science Fiction');
    const genre2 = body.find((genre) => genre.name === 'Romance');

    expect(genre1).toBeDefined();
    expect(genre2).toBeDefined();
  });

  test('PUT /api/genres/:id - Update a genre', async () => {
    const genre = await Genre.create({ name: 'Old Genre' });

    const res = await supertest(app)
      .put(`/api/genres/${genre.id}`)
      .send({ name: 'Updated Genre' });

    // Vérifications sur la réponse
    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('application/json');

    const body = res.body;
    expect(body.name).toBe('Updated Genre');
    expect(body._id).toBe(genre.id.toString());
  });

  test('DELETE /api/genres/:id - Delete a genre', async () => {
    const genre = await Genre.create({ name: 'To Delete' });

    const res = await supertest(app).delete(`/api/genres/${genre._id}`);

    // Vérifications sur la réponse
    expect(res.status).toBe(204);

    // Vérifiez que le genre a bien été supprimé
    const deletedGenre = await Genre.findById(genre._id);
    expect(deletedGenre).toBeNull();
  });
});

// Déconnexion de la base de données après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
});

