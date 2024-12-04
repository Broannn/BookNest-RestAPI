const request = require('supertest');
const app = require('../app.js');

const Wishlist = require('../models/whishlistModel.js');

describe('Wishlist CRUD operations', () => {
  test('Create a wishlist item (POST /wishlist)', async () => {
    const response = await request(app).post('/api/wishlist').send({
      user_id: '123456789012345678901234', // Remplacez par un ID valide
      book_id: '123456789012345678901234', // Remplacez par un ID valide
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
  });

  test('Read all wishlist items (GET /wishlist)', async () => {
    await Wishlist.create({ user_id: '123456789012345678901234', book_id: '123456789012345678901234' });
    const response = await request(app).get('/api/wishlist');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('Delete a wishlist item (DELETE /wishlist/:id)', async () => {
    const wishlist = await Wishlist.create({ user_id: '123456789012345678901234', book_id: '123456789012345678901234' });
    const response = await request(app).delete(`/api/wishlist/${wishlist._id}`);
    expect(response.status).toBe(204);
  });
});
