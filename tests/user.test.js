const request = require('supertest');
const app = require('../app.js');

const User = require('../models/userModel.js');

describe('User CRUD operations', () => {
  let token;

  beforeEach(async () => {
    // Créer un utilisateur pour les tests
    const user = await User.create({ username: 'testuser', email: 'test@example.com', password: 'password' });
    token = `Bearer ${user.generateAuthToken()}`; // Générer un token JWT si implémenté
  });

  test('Create a user (POST /users)', async () => {
    const response = await request(app).post('/api/users').send({
      username: 'newuser',
      email: 'new@example.com',
      password: 'newpassword',
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
  });

  test('Read all users (GET /users)', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('Update a user (PATCH /users/:id)', async () => {
    const user = await User.findOne({ username: 'testuser' });
    const response = await request(app)
      .patch(`/api/users/${user._id}`)
      .set('Authorization', token)
      .send({ username: 'updateduser' });
    expect(response.status).toBe(200);
    expect(response.body.username).toBe('updateduser');
  });

  test('Delete a user (DELETE /users/:id)', async () => {
    const user = await User.findOne({ username: 'testuser' });
    const response = await request(app).delete(`/api/users/${user._id}`).set('Authorization', token);
    expect(response.status).toBe(204);
  });
});
