import express from 'express';
import User from '../models/userModel.js'; // Assurez-vous que le chemin est correct
import * as utils from './utils.js'; // Inclure vos utilitaires si nécessaire
import * as config from '../../config.js'; // Inclure la configuration si nécessaire
import debugLib from 'debug';
import bcrypt from 'bcrypt'; // Pour le hashing des mots de passe
import jwt from 'jsonwebtoken'; // Pour la gestion des tokens JWT

import AlreadyRead from '../models/alreadyreadModel.js';
import {
  getBooksReadByUser,
  markBookAsRead,
  removeBookFromReadList
} from '../services/alreadyReadService.js';
import Favorite from '../models/favoriteModel.js';
import {
  markBookAsFavorite,
  getFavoriteBooksByUser
} from '../services/favoriteService.js';
import Wishlist from '../models/whishlistModel.js';
import {
  addBookToWishlist,
  getWishlistBooksByUser,
  removeBookFromWishlist
} from '../services/wishlistService.js';

import {
  authorizeUser
} from '../middlewares/authMiddleware.js';
import {
  authenticate
} from '../middlewares/authenticate.js'; // Middleware pour vérifier le JWT

const debug = debugLib('app:users');
const router = express.Router();

/**
 * @api {post} /api/users Créer un utilisateur
 * @apiName CreerUtilisateur
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Enregistre un nouvel utilisateur avec un mot de passe hashé.
 *
 * @apiBody {String} username Nom d'utilisateur unique
 * @apiBody {String} email Adresse e-mail unique de l'utilisateur
 * @apiBody {String} password Mot de passe de l'utilisateur
 * @apiSuccess {String} id Identifiant unique de l'utilisateur
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     {
 *       "id": "12345",
 *       "username": "user1",
 *       "email": "user1@example.com"
 *     }
 * @apiError 400 Le nom d'utilisateur ou l'adresse e-mail existe déjà.
 */
router.post('/', utils.requireJson, (req, res, next) => {
  const saltRounds = 10;
  bcrypt.hash(req.body.password, saltRounds)
    .then(hashedPassword => {
      req.body.password = hashedPassword;
      const newUser = new User(req.body);
      return newUser.save();
    })
    .then(createdUser => {
      debug(`Utilisateur créé "${createdUser.username}"`);
      res.status(201).set('Location', `${config.baseUrl}/api/users/${createdUser._id}`).send(createdUser);
    })
    .catch(err => {
      if (err.code === 11000) {
        res.status(400).send({ error: 'Le nom d\'utilisateur ou l\'e-mail existe déjà.' });
      } else {
        next(err);
      }
    });
});

/**
 * @api {get} /api/users Récupérer tous les utilisateurs
 * @apiName GetUsers
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Retourne une liste de tous les utilisateurs.
 *
 * @apiSuccess {Object[]} users Liste des utilisateurs
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": "12345",
 *         "username": "user1",
 *         "email": "user1@example.com"
 *       }
 *     ]
 */
router.get('/', (req, res, next) => {
  User.find()
    .then(users => res.status(200).send(users))
    .catch(next);
});

/**
 * @api {get} /api/users/:id Récupérer un utilisateur
 * @apiName GetUserById
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Retourne les détails d'un utilisateur spécifique.
 *
 * @apiParam {String} id Identifiant unique de l'utilisateur
 * @apiSuccess {Object} user Détails de l'utilisateur
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     {
 *       "id": "12345",
 *       "username": "user1",
 *       "email": "user1@example.com"
 *     }
 * @apiError 404 Utilisateur introuvable
 */
router.get('/:id', (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      if (!user) {
        res.status(404).send({ error: 'Utilisateur introuvable.' });
      } else {
        res.status(200).send(user);
      }
    })
    .catch(next);
});

/**
 * @api {put} /api/users/:id Mettre à jour un utilisateur
 * @apiName UpdateUser
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Modifie les informations d'un utilisateur.
 *
 * @apiParam {String} id Identifiant unique de l'utilisateur
 * @apiBody {String} [username] Nouveau nom d'utilisateur
 * @apiBody {String} [email] Nouvelle adresse e-mail
 * @apiBody {String} [password] Nouveau mot de passe
 * @apiSuccess {Object} user Utilisateur mis à jour
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     {
 *       "id": "12345",
 *       "username": "userUpdated",
 *       "email": "updated@example.com"
 *     }
 * @apiError 404 Utilisateur introuvable
 */
router.put(
  '/:id',
  authenticate,
  authorizeUser,
  utils.requireJson,
  (req, res, next) => {
    User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .then(updatedUser => {
        if (!updatedUser) {
          res.status(404).send({ error: 'Utilisateur introuvable.' });
        } else {
          res.status(200).send(updatedUser);
        }
      })
      .catch(err => {
        if (err.code === 11000) {
          res.status(400).send({ error: 'Nom d\'utilisateur ou e-mail déjà utilisé.' });
        } else {
          next(err);
        }
      });
  }
);

/**
 * @api {delete} /api/users/:id Supprimer un utilisateur
 * @apiName DeleteUser
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Supprime un utilisateur par son identifiant.
 *
 * @apiParam {String} id Identifiant unique de l'utilisateur
 * @apiSuccessExample {json} 204 Aucun contenu
 *     HTTP/1.1 204 Aucun contenu
 * @apiError 404 Utilisateur introuvable
 */
router.delete(
  '/:id',
  authenticate,
  authorizeUser,
  (req, res, next) => {
    User.findByIdAndDelete(req.params.id)
      .then(deletedUser => {
        if (!deletedUser) {
          res.status(404).send({ error: 'Utilisateur introuvable.' });
        } else {
          res.status(204).send();
        }
      })
      .catch(next);
  }
)
/**
 * @api {post} /api/users/login Authentifier un utilisateur
 * @apiName LoginUser
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Authentifie un utilisateur et retourne un token JWT.
 *
 * @apiBody {String} email Adresse e-mail de l'utilisateur
 * @apiBody {String} password Mot de passe de l'utilisateur
 * @apiSuccess {String} token Token JWT pour authentification
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Authentification réussie.",
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
 *     }
 * @apiError 400 Identifiants invalides
 */
router.post('/login', utils.requireJson, (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(400).send({ error: 'Utilisateur introuvable.' });
      }
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            return res.status(400).send({ error: 'Mot de passe incorrect.' });
          }
          const token = jwt.sign(
            { sub: user._id, username: user.username },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '1h' }
          );
          res.status(200).send({ message: 'Authentification réussie.', token });
        });
    })
    .catch(err => {
      next(err);
    });
});

/**
 * @api {post} /api/users/:userId/already-read Ajouter un livre comme "déjà lu"
 * @apiName MarkBookAsRead
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Marque un livre comme "déjà lu" par l'utilisateur.
 *
 * @apiParam {String} userId ID de l'utilisateur
 * @apiBody {String} bookId ID du livre
 * @apiSuccess {Object} alreadyRead Information sur le livre marqué comme lu
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     {
 *       "userId": "12345",
 *       "bookId": "67890",
 *       "createdAt": "2025-01-13T10:00:00.000Z"
 *     }
 */
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

/**
 * @api {get} /api/users/:userId/already-read Récupérer les livres lus par un utilisateur
 * @apiName GetBooksReadByUser
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Retourne la liste des livres que l'utilisateur a déjà lus.
 *
 * @apiParam {String} userId ID de l'utilisateur
 * @apiSuccess {Object[]} books Liste des livres lus
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "bookId": "67890",
 *         "title": "Titre du Livre",
 *         "author": "Auteur",
 *         "readAt": "2025-01-13T10:00:00.000Z"
 *       }
 *     ]
 */
router.get('/:userId/already-read', async (req, res, next) => {
  const { userId } = req.params;

  try {
    let books = await getBooksReadByUser(userId);
    books = Array.isArray(books) ? books : [books];
    res.status(200).send(books);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {delete} /api/users/:userId/already-read/:bookId Supprimer un livre de la liste "déjà lus"
 * @apiName RemoveBookFromReadList
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Supprime un livre de la liste "déjà lus" d'un utilisateur.
 *
 * @apiParam {String} userId ID de l'utilisateur
 * @apiParam {String} bookId ID du livre
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Book successfully removed from read list"
 *     }
 * @apiError 404 Livre non trouvé dans la liste "déjà lus"
 */
router.delete('/:userId/already-read/:bookId', async (req, res, next) => {
  const { userId, bookId } = req.params;

  try {
    const result = await removeBookFromReadList(userId, bookId);
    if (result) {
      res.status(200).send({ message: 'Book successfully removed from read list' });
    } else {
      res.status(404).send({ message: 'Book not found in read list' });
    }
  } catch (err) {
    next(err);
  }
});

//Favoris

/**
 * @api {post} /api/users/:userId/favorites Ajouter un livre aux favoris
 * @apiName AddFavoriteBook
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Ajoute un livre à la liste des favoris d'un utilisateur.
 *
 * @apiParam {String} userId ID de l'utilisateur
 * @apiBody {String} bookId ID du livre
 * @apiSuccess {Object} favorite Détails du favori ajouté
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     {
 *       "userId": "12345",
 *       "bookId": "67890",
 *       "addedAt": "2025-01-13T10:00:00.000Z"
 *     }
 */
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

/**
 * @api {get} /api/users/:userId/favorites Récupérer les favoris
 * @apiName GetFavoriteBooks
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Récupère la liste des livres favoris d'un utilisateur.
 *
 * @apiParam {String} userId ID de l'utilisateur
 * @apiSuccess {Object[]} favoriteBooks Liste des livres favoris
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "bookId": "67890",
 *         "title": "Titre du Livre",
 *         "author": "Auteur",
 *         "addedAt": "2025-01-13T10:00:00.000Z"
 *       }
 *     ]
 */
router.get('/:userId/favorites', async (req, res, next) => {
  const { userId } = req.params;

  try {
    const favoriteBooks = await getFavoriteBooksByUser(userId);
    res.status(200).send(favoriteBooks);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {delete} /api/users/:userId/favorites/:bookId Supprimer un favori
 * @apiName RemoveFavoriteBook
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Supprime un livre des favoris d'un utilisateur.
 *
 * @apiParam {String} userId ID de l'utilisateur
 * @apiParam {String} bookId ID du livre
 * @apiSuccessExample {json} 204 Aucun contenu
 *     HTTP/1.1 204 Aucun contenu
 * @apiError 404 Favori non trouvé
 */
router.delete('/:userId/favorites/:bookId', async (req, res, next) => {
  const { userId, bookId } = req.params;

  try {
    const result = await Favorite.findOneAndDelete({
      user_id: userId,
      book_id: bookId
    });
    if (!result) {
      return res.status(404).send({ message: 'Favori non trouvé' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * @api {post} /api/users/:userId/wishlist Ajouter un livre à la wishlist
 * @apiName AddBookToWishlist
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Ajoute un livre à la liste de souhaits d'un utilisateur.
 *
 * @apiParam {String} userId ID de l'utilisateur
 * @apiBody {String} bookId ID du livre
 * @apiSuccess {Object} wishlistItem Détails de l'élément ajouté
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     {
 *       "userId": "12345",
 *       "bookId": "67890",
 *       "addedAt": "2025-01-13T10:00:00.000Z"
 *     }
 */
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

/**
 * @api {get} /api/users/:userId/wishlist Récupérer la wishlist
 * @apiName GetWishlist
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Récupère la liste des livres dans la wishlist d'un utilisateur.
 *
 * @apiParam {String} userId ID de l'utilisateur
 * @apiSuccess {Object[]} wishlistBooks Liste des livres dans la wishlist
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "bookId": "67890",
 *         "title": "Titre du Livre",
 *         "author": "Auteur",
 *         "addedAt": "2025-01-13T10:00:00.000Z"
 *       }
 *     ]
 */
router.get('/:userId/wishlist', async (req, res, next) => {
  const { userId } = req.params;

  try {
    const wishlistBooks = await getWishlistBooksByUser(userId);
    res.status(200).send(wishlistBooks);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {delete} /api/users/:userId/wishlist/:bookId Supprimer un livre de la wishlist
 * @apiName RemoveBookFromWishlist
 * @apiGroup Utilisateur
 * @apiVersion 1.0.0
 * @apiDescription Supprime un livre de la wishlist d'un utilisateur.
 *
 * @apiParam {String} userId ID de l'utilisateur
 * @apiParam {String} bookId ID du livre
 * @apiSuccessExample {json} 204 Aucun contenu
 *     HTTP/1.1 204 Aucun contenu
 * @apiError 404 Élement non trouvé dans la wishlist
 */
router.delete('/:userId/wishlist/:bookId', async (req, res, next) => {
  const { userId, bookId } = req.params;

  try {
    const result = await Wishlist.findOneAndDelete({
      user_id: userId,
      book_id: bookId
    });
    if (!result) {
      return res.status(404).send({ message: 'Élement non trouvé dans la wishlist' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});


export default router;