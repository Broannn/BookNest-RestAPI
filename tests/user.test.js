import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import User from '../src/models/userModel.js';
import { cleanUpDatabase } from './utils.js'; // Assurez-vous d'avoir un utilitaire pour nettoyer la base de données
import { baseUrl } from '../config.js';
import bcrypt from 'bcrypt'; // Pour le hashing des mots de passe

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

// Test pour récupérer tous les utilisateurs
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

  // Vérifiez que le premier utilisateur est correct
  expect(body[0].username).toBe('user1');
  expect(body[0].email).toBe('user1@example.com');
  expect(Object.keys(body[0]).sort()).toEqual(['created_at', 'email', 'id', 'username']);

  // Vérifiez que le second utilisateur est correct
  expect(body[1].username).toBe('user2');
  expect(body[1].email).toBe('user2@example.com');
});
test('POST /api/users/login - Authentification et récupération de token', async () => {

  // Effectuer la requête de login
  const res = await supertest(app)
    .post('/api/users/login')
    .send({ email: 'new@example.com', password: 'newpassword' });

  // Vérifications
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('token');
  expect(res.body.message).toBe('Authentification réussie.');

  // Retourner le token pour les autres tests
  return res.body.token;
});
test('PUT /api/users/:id - Mise à jour d\'un utilisateur avec authentification', async () => {
  // Créer un utilisateur
  const user = await User.create({
    username: 'olduser',
    email: 'olduser@example.com',
    password: 'oldpassword',
  });

  // Simuler un login pour obtenir un token
  const loginRes = await supertest(app)
    .post('/api/users/login')
    .send({ email: 'new@example.com', password: 'newpassword' });

  const token = loginRes.body.token; // Récupérer le token

  // Effectuer la mise à jour avec le token
  const res = await supertest(app)
    .put(`/api/users/675074151dcfeff9b8da05ac`)
    .set('Authorization', `Bearer ${token}`) // Ajouter l'en-tête Authorization
    .send({ username: 'updateduser' });

  // Vérifications
  expect(res.status).toBe(200);
  expect(res.get('Content-Type')).toContain('application/json');

  const body = res.body;
  expect(body.username).toBe('updateduser');
  expect(body.email).toBe('olduser@example.com');
  expect(typeof body._id).toBe('string');
});


// Test pour supprimer un utilisateur
test('DELETE /api/users/:id', async () => {
  const user = await User.create({ username: 'todelete', email: 'delete@example.com', password: 'password' });

  const res = await supertest(app).delete(`/api/users/675074151dcfeff9b8da05ac`);

  // Vérifications sur la réponse
  expect(res.status).toBe(204);

  // Vérifiez que l'utilisateur a bien été supprimé
  const deletedUser = await User.findById(user.id);
  expect(deletedUser).toBeNull();
});

// Déconnexion de la base de données après tous les tests
afterAll(mongoose.disconnect);
