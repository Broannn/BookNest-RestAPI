const request = require('supertest');
const app = require('../app.js');

const Book  = require( '../models/bookModel.js');

describe('Book CRUD operations', () => {
  test('Create a book (POST /books)', async () => {
    const response = await request(app).post('/api/books').send({
      title: 'Test Book',
      author_id: '123456789012345678901234', // Utilisez un ID MongoDB valide
      genres: ['Fiction'],
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
  });

  test('Read all books (GET /books)', async () => {
    const response = await request(app).get('/api/books');
    expect(response.status).toBe(200);
  });

  test('Update a book (PATCH /books/:id)', async () => {
    const book = await Book.create({ title: 'Old Title', author_id: '123456789012345678901234', genres: ['Fiction'] });
    const response = await request(app).patch(`/api/books/${book._id}`).send({ title: 'New Title' });
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('New Title');
  });

  test('Delete a book (DELETE /books/:id)', async () => {
    const book = await Book.create({ title: 'To Delete', author_id: '123456789012345678901234', genres: ['Fiction'] });
    const response = await request(app).delete(`/api/books/${book._id}`);
    expect(response.status).toBe(204);
  });
});
