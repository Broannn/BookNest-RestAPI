import request from 'supertest'
import app from '../app.js'
import AlreadyRead from '../src/models/alreadyreadModel.js';

describe('Already Read CRUD operations', () => {
  test('Mark a book as read (POST /already-read)', async () => {
    const response = await request(app).post('/api/already-read').send({
      user_id: '123456789012345678901234', // Remplacez par un ID valide
      book_id: '123456789012345678901234', // Remplacez par un ID valide
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
  });

  test('Read all books marked as read (GET /already-read)', async () => {
    await AlreadyRead.create({ user_id: '123456789012345678901234', book_id: '123456789012345678901234' });
    const response = await request(app).get('/api/already-read');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('Delete a read record (DELETE /already-read/:id)', async () => {
    const alreadyRead = await AlreadyRead.create({ user_id: '123456789012345678901234', book_id: '123456789012345678901234' });
    const response = await request(app).delete(`/api/already-read/${alreadyRead._id}`);
    expect(response.status).toBe(204);
  });
});
