const request = require('supertest');
const app = require('../app.js');

const Favorite  = require( '../models/favoriteModel.js');

describe('Favorite CRUD operations', () => {
  test('Create a favorite (POST /favorites)', async () => {
    const response = await request(app).post('/api/favorites').send({
      user_id: '123456789012345678901234', // Remplacez par un ID valide
      book_id: '123456789012345678901234', // Remplacez par un ID valide
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
  });

  test('Read all favorites (GET /favorites)', async () => {
    await Favorite.create({ user_id: '123456789012345678901234', book_id: '123456789012345678901234' });
    const response = await request(app).get('/api/favorites');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('Delete a favorite (DELETE /favorites/:id)', async () => {
    const favorite = await Favorite.create({ user_id: '123456789012345678901234', book_id: '123456789012345678901234' });
    const response = await request(app).delete(`/api/favorites/${favorite._id}`);
    expect(response.status).toBe(204);
  });
});
