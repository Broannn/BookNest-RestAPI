import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import User from '../src/models/userModel.js';
import { cleanUpDatabase } from './utils.js';
import { baseUrl } from '../config.js';
import bcrypt from 'bcrypt';

// Nettoyer la base de données avant chaque test
beforeEach(cleanUpDatabase);

// Test pour créer un utilisateur
test('POST /api/users', async () => {
  const res = await supertest(app).post('/api/users').send({
    username: 'newuser',
    email: 'new@example.com',
    password: 'newpassword',
  });

  // Vérifications sur la réponse
  expect(res.status).toBe(201);
  expect(res.get('Content-Type')).toContain('application/json');

  const body = res.body;
  expect(typeof body).toBe('object');
  expect(body.username).toBe('newuser');
  expect(body.email).toBe('new@example.com');
  expect(typeof body.id).toBe('string');
  expect(Object.keys(body).sort()).toEqual(['created_at', 'email', 'id', 'username']);

  // Vérifiez que l'en-tête Location pointe vers la ressource créée
  expect(res.get('Location')).toEqual(`${baseUrl}/api/users/${body.id}`);
});

test('GET /api/users', async () => {
  // Créez deux utilisateurs dans la base de données avant le test
  await Promise.all([
    User.create({ username: 'user1', email: 'user1@example.com', password: 'password' }),
    User.create({ username: 'user2', email: 'user2@example.com', password: 'password' }),
  ]);

  const res = await supertest(app).get('/api/users');

  // Vérifications sur la réponse
  expect(res.status).toBe(200);
  expect(res.get('Content-Type')).toContain('application/json');

  const body = res.body;
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(2);

  // Recherchez les utilisateurs par leur contenu
  const user1 = body.find((user) => user.username === 'user1');
  const user2 = body.find((user) => user.username === 'user2');

  // Vérifiez les informations de user1
  expect(user1).toBeDefined();
  expect(user1.email).toBe('user1@example.com');
  expect(Object.keys(user1).sort()).toEqual(['created_at', 'email', 'id', 'username']);

  // Vérifiez les informations de user2
  expect(user2).toBeDefined();
  expect(user2.email).toBe('user2@example.com');
});

test('GET /api/users/:id', async () => {
  // Créez un utilisateur dans la base de données avant le test
  const user = await User.create({
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password'
  });

  // Effectuez une requête GET pour récupérer cet utilisateur
  const res = await supertest(app).get(`/api/users/${user.id}`);

  // Vérifications sur la réponse
  expect(res.status).toBe(200);
  expect(res.get('Content-Type')).toContain('application/json');

  const body = res.body;

  // Vérifiez que l'utilisateur retourné correspond
  expect(body).toBeDefined();
  expect(body.id).toBe(user.id);
  expect(body.username).toBe('testuser');
  expect(body.email).toBe('testuser@example.com');
  expect(Object.keys(body).sort()).toEqual(['created_at', 'email', 'id', 'username']);
});



// Test pour récupérer un utilisateur par ID
test('POST /api/users/login - Authentification et récupération de token', async () => {
  // Création d'un nouvel utilisateur
  const userCreationResponse = await supertest(app).post('/api/users').send({
    username: 'newuser',
    email: 'new@example.com',
    password: 'newpassword',
  });

  // Vérification de la création de l'utilisateur
  expect(userCreationResponse.status).toBe(201);

  // Effectuer la requête de login
  const loginResponse = await supertest(app)
    .post('/api/users/login')
    .send({ email: 'new@example.com', password: 'newpassword' });

  // Vérifications pour le login
  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body).toHaveProperty('token');
  expect(loginResponse.body).toHaveProperty('message', 'Authentification réussie.');

  // Retourner le token pour les autres tests si nécessaire
  return loginResponse.body.token;
});


// Test pour récupérer un utilisateur par ID
test('PUT /api/users/:id - Authorization', async () => {
  // Créez un utilisateur
  const userCreationResponse = await supertest(app).post('/api/users').send({
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword',
  });

  expect(userCreationResponse.status).toBe(201);
  const userId = userCreationResponse.body._id;

  // Authentifiez l'utilisateur pour obtenir un token
  const loginResponse = await supertest(app)
    .post('/api/users/login')
    .send({ email: 'test@example.com', password: 'testpassword' });

  expect(loginResponse.status).toBe(200);
  const token = loginResponse.body.token;

  // Tentez de modifier un autre utilisateur
  const unauthorizedResponse = await supertest(app)
    .put(`/api/users/someOtherUserId`) // ID différent
    .set('Authorization', `Bearer ${token}`)
    .send({ username: 'newusername' });

  expect(unauthorizedResponse.status).toBe(403);
  expect(unauthorizedResponse.body).toHaveProperty('error', 'Forbidden: You do not have permission to perform this action');
});




test('DELETE /api/users/:id', async () => {
  // Créez un utilisateur
  const userCreationResponse = await supertest(app).post('/api/users').send({
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword',
  });

  expect(userCreationResponse.status).toBe(201);
  const userId = userCreationResponse.body.id;

  // Authentifiez l'utilisateur pour obtenir un token
  const loginResponse = await supertest(app)
    .post('/api/users/login')
    .send({ email: 'test@example.com', password: 'testpassword' });

  expect(loginResponse.status).toBe(200);
  const token = loginResponse.body.token;

  // Supprimez l'utilisateur avec le token
  const deleteResponse = await supertest(app)
    .delete(`/api/users/${userId}`)
    .set('Authorization', `Bearer ${token}`);

  // Vérifications sur la réponse
  expect(deleteResponse.status).toBe(204);

  // Vérifiez que l'utilisateur a bien été supprimé
  const deletedUser = await User.findById(userId);
  expect(deletedUser).toBeNull();
});

// test('POST /api/users - Ne permet pas deux utilisateurs avec le même username', async () => {
//     // Créez un utilisateur avec un username
//     await supertest(app).post('/api/users').send({
//       username: 'duplicateuser',
//       email: 'first@example.com',
//       password: 'password123',
//     });
  
//     // Tentez de créer un autre utilisateur avec le même username
//     const res = await supertest(app).post('/api/users').send({
//       username: 'duplicateuser', // Même username
//       email: 'second@example.com',
//       password: 'password456',
//     });
  
//     // Vérifications sur la réponse
//     expect(res.status).toBe(400); // 400 Bad Request ou une autre réponse selon votre logique
//     expect(res.body).toHaveProperty('error');
//     expect(res.body.error).toContain('duplicate key'); // Vérifiez le message d'erreur, selon votre implémentation
//   });
  

// Déconnexion de la base de données après tous les tests
afterAll(mongoose.disconnect);