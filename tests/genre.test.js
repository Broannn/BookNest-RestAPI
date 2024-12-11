// import request from 'supertest';
// import app from '../app.js';
// import Genre from '../src/models/genreModel.js';

// describe('Genre CRUD operations', () => {
//   test('Create a genre (POST /genres)', async () => {
//     const response = await request(app).post('/api/genres').send({
//       name: 'Fantasy',
//     });
//     expect(response.status).toBe(201);
//     expect(response.body).toHaveProperty('_id');
//     expect(response.body.name).toBe('Fantasy');
//   });

//   test('Read all genres (GET /genres)', async () => {
//     await Genre.create({ name: 'Science Fiction' });
//     const response = await request(app).get('/api/genres');
//     expect(response.status).toBe(200);
//     expect(response.body.length).toBeGreaterThan(0);
//   });

//   test('Update a genre (PATCH /genres/:id)', async () => {
//     const genre = await Genre.create({ name: 'Old Genre' });
//     const response = await request(app).patch(`/api/genres/${genre._id}`).send({ name: 'Updated Genre' });
//     expect(response.status).toBe(200);
//     expect(response.body.name).toBe('Updated Genre');
//   });

//   test('Delete a genre (DELETE /genres/:id)', async () => {
//     const genre = await Genre.create({ name: 'To Delete' });
//     const response = await request(app).delete(`/api/genres/${genre._id}`);
//     expect(response.status).toBe(204);
//   });
// });
