import express from 'express';
import User from '../models/userModel.js'; // Assurez-vous que le chemin est correct
import * as utils from './utils.js'; // Inclure vos utilitaires si nécessaire
import * as config from '../../config.js'; // Inclure la configuration si nécessaire
import debugLib from 'debug';
import bcrypt from 'bcrypt'; // Pour le hashing des mots de passe
import jwt from 'jsonwebtoken'; // Pour la gestion des tokens JWT

import AlreadyRead from '../models/alreadyreadModel.js';
import { getBooksReadByUser, markBookAsRead } from '../services/alreadyReadService.js';
import Favorite from '../models/favoriteModel.js';
import { markBookAsFavorite, getFavoriteBooksByUser } from '../services/favoriteService.js';
import Wishlist from '../models/whishlistModel.js';
import { addBookToWishlist, getWishlistBooksByUser, removeBookFromWishlist } from '../services/wishlistService.js';


const debug = debugLib('app:users');
const router = express.Router();

// CREATE (POST)
router.post('/', utils.requireJson, (req, res, next) => {
  new User(req.body)
    .save()
    .then(createdUser => {
      debug(`Created user "${createdUser.username}"`);
      res
        .status(201)
        .set('Location', `${config.baseUrl}/api/users/${createdUser._id}`)
        .send(createdUser);
    })
    .catch(err => {
      if (err.code === 11000) {
        // Gestion des doublons pour username/email
        return res.status(400).send({ error: 'Username or email already exists' });
      }
      next(err);
    });
});

// READ ALL (GET)
router.get('/', (req, res, next) => {
  User.find()
    .then(users => {
      res.status(200).send(users); // Les utilisateurs retournés n'incluent pas les mots de passe grâce au `toJSON`
    })
    .catch(next);
});

// READ ONE (GET by ID)
router.get('/:id', (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
      res.status(200).send(user);
    })
    .catch(next);
});

// UPDATE (PUT)
router.put('/:id', utils.requireJson, (req, res, next) => {
  User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .then(updatedUser => {
      if (!updatedUser) {
        return res.status(404).send({ error: 'User not found' });
      }
      debug(`Updated user "${updatedUser.username}"`);
      res.status(200).send(updatedUser);
    })
    .catch(err => {
      if (err.code === 11000) {
        // Gestion des doublons pour username/email
        return res.status(400).send({ error: 'Username or email already exists' });
      }
      next(err);
    });
});

// DELETE (DELETE)
router.delete('/:id', (req, res, next) => {
  User.findByIdAndDelete(req.params.id)
    .then(deletedUser => {
      if (!deletedUser) {
        return res.status(404).send({ error: 'User not found' });
      }
      debug(`Deleted user "${deletedUser.username}"`);
      res.status(204).send(); // No content
    })
    .catch(next);
});

// Route pour le login
router.post('/login', utils.requireJson, (req, res, next) => {
  const { email, password } = req.body;

  // Vérifier si l'utilisateur existe
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(400).send({ error: 'Utilisateur introuvable.' });
      }

      // Comparer le mot de passe avec celui stocké dans la base de données
      return bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            return res.status(400).send({ error: 'Mot de passe incorrect.' });
          }

          // Créer un token JWT
          const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '1h' }
          );

          // Répondre avec le token
          res.status(200).send({ message: 'Authentification réussie.', token });
        });
    })
    .catch(err => {
      next(err); // Passer l'erreur à l'erreur middleware
    });
});



// READ ALL BOOKS READ BY USER

// Ajouter un livre comme "déjà lu" par l'utilisateur
router.post('/:userId/already-read', async (req, res, next) => {
    const { userId } = req.params;
    const { bookId } = req.body;
  
    try {
      const alreadyRead = await markBookAsRead(userId, bookId);
      res.status(201).send(alreadyRead);
    } catch (err) {
      next(err);
    }
  });
  
  // Récupérer les livres lus par un utilisateur
  router.get('/:userId/already-read', async (req, res, next) => {
    const { userId } = req.params;
  
    try {
      const books = await getBooksReadByUser(userId);
      res.status(200).send(books);
    } catch (err) {
      next(err);
    }
  });




//Favoris

// Ajouter un livre aux favoris d'un utilisateur
router.post('/:userId/favorites', async (req, res, next) => {
    const { userId } = req.params;
    const { bookId } = req.body;
  
    try {
      const favorite = await markBookAsFavorite(userId, bookId);
      res.status(201).send(favorite);
    } catch (err) {
      next(err);
    }
  });
  
  // Récupérer les livres favoris d'un utilisateur
  router.get('/:userId/favorites', async (req, res, next) => {
    const { userId } = req.params;
  
    try {
      const favoriteBooks = await getFavoriteBooksByUser(userId);
      res.status(200).send(favoriteBooks);
    } catch (err) {
      next(err);
    }
  });
  
  // Supprimer un livre des favoris d'un utilisateur
  router.delete('/:userId/favorites/:bookId', async (req, res, next) => {
    const { userId, bookId } = req.params;
  
    try {
      const result = await Favorite.findOneAndDelete({ user_id: userId, book_id: bookId });
      if (!result) {
        return res.status(404).send({ message: 'Favorite not found' });
      }
      res.status(204).send(); // No content
    } catch (err) {
      next(err);
    }
  });



  //Wishlist

  // Ajouter un livre à la wishlist d'un utilisateur
router.post('/:userId/wishlist', async (req, res, next) => {
    const { userId } = req.params;
    const { bookId } = req.body;
  
    try {
      const wishlistItem = await addBookToWishlist(userId, bookId);
      res.status(201).send(wishlistItem);
    } catch (err) {
      next(err);
    }
  });
  
  // Récupérer les livres dans la wishlist d'un utilisateur
  router.get('/:userId/wishlist', async (req, res, next) => {
    const { userId } = req.params;
  
    try {
      const wishlistBooks = await getWishlistBooksByUser(userId);
      res.status(200).send(wishlistBooks);
    } catch (err) {
      next(err);
    }
  });
  
  // Supprimer un livre de la wishlist d'un utilisateur
  router.delete('/:userId/wishlist/:bookId', async (req, res, next) => {
    const { userId, bookId } = req.params;
  
    try {
      const result = await Wishlist.findOneAndDelete({ user_id: userId, book_id: bookId });
      if (!result) {
        return res.status(404).send({ message: 'Wishlist item not found' });
      }
      res.status(204).send(); // No content
    } catch (err) {
      next(err);
    }
  });
  

export default router;
