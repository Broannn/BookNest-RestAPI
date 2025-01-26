import express from "express";
import Book from "../models/bookModel.js"; // Assurez-vous que le chemin est correct
import * as utils from "./utils.js"; // Inclure vos utilitaires si nécessaire
import * as config from "../../config.js"; // Inclure la configuration si nécessaire
import debugLib from "debug";

import BookGenre from "../models/bookgenreModel.js";
import {
  addGenreToBook,
  getGenresByBook,
  removeGenreFromBook,
} from "../services/bookGenreService.js";
import BookOfDay from "../models/bookofdayModel.js";
import {
  addBookOfDay,
  getBooksOfDay,
  addDiscussionToBookOfDay,
  getDiscussionsByBookOfDay,
} from "../services/bookOfDayService.js";
import Critique from '../models/critiqueModel.js';
import {
  addCritique,
  getCritiquesByBook,
  getCritiqueByUserAndBook,
  updateCritique,
  deleteCritique
} from '../services/critiqueService.js';

import {
  authorizeOwner
} from '../middlewares/authMiddleware.js';
import {
  authenticate
} from '../middlewares/authenticate.js'; // Middleware pour vérifier le JWT


const debug = debugLib("app:books");
const router = express.Router();

/**
 * @api {post} /api/books Créer un livre
 * @apiName CreateBook
 * @apiGroup Livre
 * @apiVersion 1.0.0
 * @apiDescription Ajoute un nouveau livre dans le système.
 *
 * @apiBody {String} title Titre du livre
 * @apiBody {String} [author_id] ID de l'auteur du livre
 * @apiBody {Array} [genres] Liste des genres associés au livre
 * @apiSuccess {Object} book Le livre créé
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     {
 *       "id": "12345",
 *       "title": "Mon Livre",
 *       "author_id": "67890",
 *       "genres": ["fantasy", "adventure"]
 *     }
 */
router.post("/", utils.requireJson, (req, res, next) => {
  new Book(req.body)
    .save()
    .then((createdBook) => {
      debug(`Livre créé "${createdBook.title}"`);
      return createdBook;
    })
    .then((createdBook) => {
      if (utils.responseShouldInclude(req, "author")) {
        return createdBook.populate("author_id").execPopulate();
      }
      return createdBook;
    })
    .then((createdBook) => {
      res
        .status(201)
        .set("Location", `${config.baseUrl}/api/books/${createdBook._id}`)
        .send(createdBook);
    })
    .catch(next);
});

/**
 * @api {get} /api/books Récupérer tous les livres
 * @apiName GetBooks
 * @apiGroup Livre
 * @apiVersion 1.0.0
 * @apiDescription Récupère une liste paginée de tous les livres.
 *
 * @apiQuery {Number} [page=1] Numéro de la page pour la pagination
 * @apiQuery {Number} [limit=10] Nombre d'éléments par page
 * @apiSuccess {Object[]} books Liste des livres
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     {
 *       "books": [
 *         {
 *           "id": "12345",
 *           "title": "Mon Livre",
 *           "author_id": "67890",
 *           "genres": ["fantasy", "adventure"]
 *         }
 *       ],
 *       "meta": {
 *         "total": 100,
 *         "page": 1,
 *         "pages": 10,
 *         "limit": 10
 *       }
 *     }
 */
router.get("/", (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  Book.find()
    .populate("author_id genres")
    .skip(skip)
    .limit(limit)
    .then(async (books) => {
      const total = await Book.countDocuments();
      return { books, total, page, pages: Math.ceil(total / limit) };
    })
    .then(({ books, total, page, pages }) => {
      res.status(200).send({
        books,
        meta: { total, page, pages, limit },
      });
    })
    .catch(next);
});

/**
 * @api {get} /api/books/:id Récupérer un livre par ID
 * @apiName GetBookById
 * @apiGroup Livre
 * @apiVersion 1.0.0
 * @apiDescription Récupère les détails d'un livre spécifique par son ID.
 *
 * @apiParam {String} id Identifiant unique du livre
 * @apiSuccess {Object} book Détails du livre
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     {
 *       "id": "12345",
 *       "title": "Mon Livre",
 *       "author_id": "67890",
 *       "genres": ["fantasy", "adventure"]
 *     }
 * @apiError 404 Livre non trouvé
 */
router.get("/:id", (req, res, next) => {
  Book.findById(req.params.id)
    .populate("author_id genres")
    .then((book) => {
      if (!book) {
        return res.status(404).send({ error: "Livre non trouvé" });
      }
      res.status(200).send(book);
    })
    .catch(next);
});

/**
 * @api {put} /api/books/:id Mettre à jour un livre
 * @apiName UpdateBook
 * @apiGroup Livre
 * @apiVersion 1.0.0
 * @apiDescription Met à jour les informations d'un livre existant.
 *
 * @apiParam {String} id Identifiant unique du livre
 * @apiBody {String} [title] Nouveau titre du livre
 * @apiBody {String} [author_id] Nouvel ID de l'auteur
 * @apiBody {Array} [genres] Nouvelle liste de genres
 * @apiSuccess {Object} book Livre mis à jour
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     {
 *       "id": "12345",
 *       "title": "Nouveau Titre",
 *       "author_id": "67890",
 *       "genres": ["romance", "drama"]
 *     }
 * @apiError 404 Livre non trouvé
 */
router.put(
  '/:id',
  utils.requireJson,
  (req, res, next) => {
    Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .then((updatedBook) => {
        if (!updatedBook) {
          return res.status(404).send({ error: "Livre non trouvé" });
        }
        res.status(200).send(updatedBook);
      })
      .catch(next);
  }
);

/**
 * @api {delete} /api/books/:id Supprimer un livre
 * @apiName DeleteBook
 * @apiGroup Livre
 * @apiVersion 1.0.0
 * @apiDescription Supprime un livre par son ID.
 *
 * @apiParam {String} id Identifiant unique du livre
 * @apiSuccessExample {json} 204 Aucun contenu
 *     HTTP/1.1 204 Aucun contenu
 * @apiError 404 Livre non trouvé
 */
router.delete('/:id', (req, res, next) => {
  Book.findByIdAndDelete(req.params.id)
    .then((deletedBook) => {
      if (!deletedBook) {
        return res.status(404).send({ error: "Livre non trouvé" });
      }
      res.status(204).send();
    })
    .catch(next);
});

/**
 * @api {get} /api/books/genre/:genreId Récupérer les livres par genre
 * @apiName GetBooksByGenre
 * @apiGroup Livre
 * @apiVersion 1.0.0
 * @apiDescription Récupère une liste de livres associés à un genre spécifique.
 *
 * @apiParam {String} genreId ID du genre
 * @apiSuccess {Object[]} books Liste des livres
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": "12345",
 *         "title": "Mon Livre",
 *         "author_id": "67890",
 *         "genres": ["fantasy", "adventure"]
 *       }
 *     ]
 * @apiError 404 Genre non trouvé
 */
router.get("/genre/:genreId", async (req, res, next) => {
  const { genreId } = req.params;

  try {
    const books = await Book.find({ genres: genreId }).populate("author_id genres");
    if (!books.length) {
      return res.status(404).send({ message: "Genre non trouvé" });
    }
    res.status(200).send(books);
  } catch (err) {
    next(err);
  }
});


// Genre du livre
/**
 * @api {post} /api/books/:bookId/genres Ajouter un genre à un livre
 * @apiName AddGenreToBook
 * @apiGroup Livre
 * @apiVersion 1.0.0
 * @apiDescription Ajoute un genre à un livre spécifique.
 *
 * @apiParam {String} bookId ID du livre
 * @apiBody {String} genreId ID du genre
 * @apiSuccess {Object} bookGenre Relation entre le livre et le genre
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     {
 *       "bookId": "12345",
 *       "genreId": "67890",
 *       "createdAt": "2025-01-13T10:00:00.000Z"
 *     }
 */
router.post("/:bookId/genres", async (req, res, next) => {
  const { bookId } = req.params;
  const { genreId } = req.body;

  try {
    const bookGenre = await addGenreToBook(bookId, genreId);
    res.status(201).send(bookGenre);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {get} /api/books/:bookId/genres Récupérer les genres d'un livre
 * @apiName GetGenresByBook
 * @apiGroup Livre
 * @apiVersion 1.0.0
 * @apiDescription Récupère la liste des genres associés à un livre spécifique.
 *
 * @apiParam {String} bookId ID du livre
 * @apiSuccess {Object[]} genres Liste des genres associés
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": "67890",
 *         "name": "Fantasy"
 *       },
 *       {
 *         "id": "12345",
 *         "name": "Adventure"
 *       }
 *     ]
 */
router.get("/:bookId/genres", async (req, res, next) => {
  const { bookId } = req.params;

  try {
    const genres = await getGenresByBook(bookId);
    res.status(200).send(genres);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {delete} /api/books/:bookId/genres/:genreId Supprimer un genre d'un livre
 * @apiName RemoveGenreFromBook
 * @apiGroup Livre
 * @apiVersion 1.0.0
 * @apiDescription Supprime un genre associé à un livre spécifique.
 *
 * @apiParam {String} bookId ID du livre
 * @apiParam {String} genreId ID du genre
 * @apiSuccessExample {json} 204 Aucun contenu
 *     HTTP/1.1 204 Aucun contenu
 * @apiError 404 Relation livre-genre non trouvée
 */
router.delete("/:bookId/genres/:genreId", async (req, res, next) => {
  const { bookId, genreId } = req.params;

  try {
    const result = await BookGenre.removeGenreFromBook({
      book_id: bookId,
      genre_id: genreId,
    });
    if (!result) {
      return res.status(404).send({
        message: "Relation livre-genre non trouvée",
      });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// router.get('/', (req, res, next) => {
//   const {
//     genre,
//     page = 1,
//     limit = 10
//   } = req.query; // Paramètres de requête
//   const skip = (page - 1) * limit; // Calcul de l'offset

//   const genreFilter = genre ?
//     BookGenre.findOne({
//       name: genre
//     }).then((foundGenre) => {
//       if (!foundGenre) {
//         return Promise.reject(new Error('Genre not found'));
//       }
//       return {
//         genre_id: foundGenre._id
//       };
//     }) :
//     Promise.resolve({}); // Pas de filtre si `genre` n'est pas fourni

//   genreFilter
//     .then((filter) =>
//       BookGenre.find(filter)
//       .populate('author_id genres') // Inclut les relations
//       .skip(skip)
//       .limit(Number(limit))
//     )
//     .then((books) =>
//       BookGenre.countDocuments().then((total) => ({
//         books,
//         total,
//         page: Number(page),
//         pages: Math.ceil(total / limit),
//       }))
//     )
//     .then(({
//       books,
//       total,
//       page,
//       pages
//     }) => {
//       res.status(200).send({
//         books,
//         meta: {
//           total,
//           page,
//           pages,
//           limit: Number(limit),
//         },
//       });
//     })
//     .catch((err) => {
//       if (err.message === 'Genre not found') {
//         return res.status(404).send({
//           error: err.message
//         });
//       }
//       next(err); // Passer au middleware d'erreur
//     });
// });




// Livre du jour

/**
 * @api {post} /api/books/bod Ajouter un livre du jour
 * @apiName AddBookOfDay
 * @apiGroup LivreDuJour
 * @apiVersion 1.0.0
 * @apiDescription Ajoute un livre comme "Livre du Jour" pour une date donnée.
 *
 * @apiBody {String} bookId ID du livre
 * @apiBody {String} date Date pour laquelle le livre est sélectionné comme "Livre du Jour"
 * @apiSuccess {Object} bookOfDay Détails du livre du jour
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     {
 *       "bookId": "12345",
 *       "date": "2025-01-13"
 *     }
 */
router.post("/bod", async (req, res, next) => {
  const { bookId, date } = req.body;

  try {
    const bookOfDay = await addBookOfDay(bookId, date);
    res.status(201).send(bookOfDay);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {get} /api/books/bod Récupérer les livres du jour
 * @apiName GetBooksOfDay
 * @apiGroup LivreDuJour
 * @apiVersion 1.0.0
 * @apiDescription Récupère une liste de tous les livres marqués comme "Livre du Jour".
 *
 * @apiSuccess {Object[]} booksOfDay Liste des livres du jour
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "bookId": "12345",
 *         "date": "2025-01-13"
 *       }
 *     ]
 */
router.get("/bod", async (req, res, next) => {
  try {
    const booksOfDay = await getBooksOfDay();
    res.status(200).send(booksOfDay);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {delete} /api/books/bod/:bookOfDayId Supprimer un livre du jour
 * @apiName DeleteBookOfDay
 * @apiGroup LivreDuJour
 * @apiVersion 1.0.0
 * @apiDescription Supprime un livre du jour par son ID.
 *
 * @apiParam {String} bookOfDayId ID du livre du jour
 * @apiSuccessExample {json} 204 Aucun contenu
 *     HTTP/1.1 204 Aucun contenu
 * @apiError 404 Livre du jour non trouvé
 */
router.delete("/bod/:bookOfDayId", async (req, res, next) => {
  const { bookOfDayId } = req.params;

  try {
    const result = await BookOfDay.findByIdAndDelete(bookOfDayId);
    if (!result) {
      return res.status(404).send({ message: "Livre du jour non trouvé" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * @api {post} /api/books/bod/:bookOfDayId/discussions Ajouter une discussion à un livre du jour
 * @apiName AddDiscussionToBookOfDay
 * @apiGroup LivreDuJour
 * @apiVersion 1.0.0
 * @apiDescription Ajoute une discussion à un "Livre du Jour" spécifique.
 *
 * @apiParam {String} bookOfDayId ID du livre du jour
 * @apiBody {String} userId ID de l'utilisateur
 * @apiBody {String} content Contenu de la discussion
 * @apiSuccess {Object} discussion Détails de la discussion ajoutée
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     {
 *       "bookOfDayId": "67890",
 *       "userId": "12345",
 *       "content": "Ceci est une discussion."
 *     }
 */
router.post("/bod/:bookOfDayId/discussions", async (req, res, next) => {
  const { bookOfDayId } = req.params;
  const { userId, content } = req.body;

  try {
    const discussion = await addDiscussionToBookOfDay(bookOfDayId, userId, content);
    res.status(201).send(discussion);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {get} /api/books/bod/:bookOfDayId/discussions Récupérer les discussions d'un livre du jour
 * @apiName GetDiscussionsByBookOfDay
 * @apiGroup LivreDuJour
 * @apiVersion 1.0.0
 * @apiDescription Récupère les discussions associées à un "Livre du Jour" spécifique.
 *
 * @apiParam {String} bookOfDayId ID du livre du jour
 * @apiSuccess {Object[]} discussions Liste des discussions
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "userId": "12345",
 *         "content": "Ceci est une discussion."
 *       }
 *     ]
 */
router.get("/bod/:bookOfDayId/discussions", async (req, res, next) => {
  const { bookOfDayId } = req.params;

  try {
    const discussions = await getDiscussionsByBookOfDay(bookOfDayId);
    res.status(200).send(discussions);
  } catch (err) {
    next(err);
  }
});


// Critique

/**
 * @api {get} /api/books/:bookId/critiques Récupérer toutes les critiques pour un livre
 * @apiName GetCritiquesByBook
 * @apiGroup Critique
 * @apiVersion 1.0.0
 * @apiDescription Récupère toutes les critiques associées à un livre spécifique.
 *
 * @apiParam {String} bookId ID du livre
 * @apiSuccess {Object[]} critiques Liste des critiques
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "userId": "12345",
 *         "rating": 4,
 *         "comment": "Très bon livre."
 *       }
 *     ]
 */
router.get('/:bookId/critiques', async (req, res, next) => {
  const { bookId } = req.params;

  try {
    const critiques = await getCritiquesByBook(bookId);
    res.status(200).send(critiques);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {post} /api/books/:bookId/critiques Ajouter une critique pour un livre
 * @apiName AddCritique
 * @apiGroup Critique
 * @apiVersion 1.0.0
 * @apiDescription Ajoute une critique pour un livre spécifique.
 *
 * @apiParam {String} bookId ID du livre
 * @apiBody {String} userId ID de l'utilisateur
 * @apiBody {Number} rating Note attribuée au livre
 * @apiBody {String} comment Commentaire sur le livre
 * @apiSuccess {Object} critique Critique ajoutée
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     {
 *       "userId": "12345",
 *       "rating": 4,
 *       "comment": "Excellent livre."
 *     }
 */
router.post('/:bookId/critiques', async (req, res, next) => {
  const { userId, rating, comment } = req.body;
  const { bookId } = req.params;

  try {
    const critique = await addCritique(userId, bookId, rating, comment);
    res.status(201).send(critique);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {get} /api/books/:bookId/critiques/user/:userId Récupérer une critique utilisateur pour un livre
 * @apiName GetCritiqueByUserAndBook
 * @apiGroup Critique
 * @apiVersion 1.0.0
 * @apiDescription Récupère la critique d'un utilisateur spécifique pour un livre donné.
 *
 * @apiParam {String} bookId ID du livre
 * @apiParam {String} userId ID de l'utilisateur
 * @apiSuccess {Object} critique Détails de la critique
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     {
 *       "userId": "12345",
 *       "rating": 5,
 *       "comment": "Un chef-d'œuvre."
 *     }
 * @apiError 404 Critique introuvable
 */
router.get('/:bookId/critiques/user/:userId', async (req, res, next) => {
  const { bookId, userId } = req.params;

  try {
    const critique = await getCritiqueByUserAndBook(userId, bookId);
    if (critique) {
      res.status(200).send(critique);
    } else {
      res.status(404).send({
        message: 'Critique introuvable'
      });
    }
  } catch (err) {
    next(err);
  }
});

/**
 * @api {put} /api/books/critiques/:critiqueId Mettre à jour une critique pour un livre
 * @apiName UpdateCritique
 * @apiGroup Critique
 * @apiVersion 1.0.0
 * @apiDescription Met à jour les détails d'une critique existante.
 *
 * @apiParam {String} critiqueId ID de la critique
 * @apiBody {Number} [rating] Nouvelle note attribuée au livre
 * @apiBody {String} [comment] Nouveau commentaire
 * @apiSuccess {Object} critique Critique mise à jour
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     {
 *       "rating": 5,
 *       "comment": "Amélioration du commentaire."
 *     }
 */
router.put('/critiques/:critiqueId', async (req, res, next) => {
  const { critiqueId } = req.params;
  const { rating, comment } = req.body;

  try {
    const updatedCritique = await updateCritique(critiqueId, rating, comment);
    res.status(200).send(updatedCritique);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {delete} /api/books/critiques/:critiqueId Supprimer une critique pour un livre
 * @apiName DeleteCritique
 * @apiGroup Critique
 * @apiVersion 1.0.0
 * @apiDescription Supprime une critique existante pour un livre donné.
 *
 * @apiParam {String} critiqueId ID de la critique
 * @apiSuccessExample {json} 204 Aucun contenu
 *     HTTP/1.1 204 Aucun contenu
 */
router.delete('/critiques/:critiqueId', async (req, res, next) => {
  const { critiqueId } = req.params;

  try {
    await deleteCritique(critiqueId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});




// Livres du Jour

/**
 * @api {post} /api/books/livres-du-jour Ajouter un livre du jour
 * @apiName AddBookOfDayFrench
 * @apiGroup LivreDuJour
 * @apiVersion 1.0.0
 * @apiDescription Ajoute un livre comme "Livre du Jour" pour une date donnée.
 *
 * @apiBody {String} bookId ID du livre
 * @apiBody {String} date Date pour laquelle le livre est sélectionné comme "Livre du Jour"
 * @apiSuccess {Object} bookOfDay Détails du livre du jour
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     {
 *       "bookId": "12345",
 *       "date": "2025-01-13"
 *     }
 */
router.post("/livres-du-jour", async (req, res, next) => {
  const { bookId, date } = req.body;

  try {
    const bookOfDay = await addBookOfDay(bookId, date);
    res.status(201).send(bookOfDay);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {get} /api/books/livres-du-jour Récupérer tous les livres du jour
 * @apiName GetAllBooksOfDayFrench
 * @apiGroup LivreDuJour
 * @apiVersion 1.0.0
 * @apiDescription Récupère une liste de tous les livres marqués comme "Livre du Jour".
 *
 * @apiSuccess {Object[]} booksOfDay Liste des livres du jour
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "bookId": "12345",
 *         "date": "2025-01-13"
 *       }
 *     ]
 */
router.get("/livres-du-jour", async (req, res, next) => {
  try {
    const booksOfDay = await getBooksOfDay();
    res.status(200).send(booksOfDay);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {post} /api/books/livres-du-jour/:bookOfDayId/discussions Ajouter une discussion à un livre du jour
 * @apiName AddDiscussionToBookOfDayFrench
 * @apiGroup LivreDuJour
 * @apiVersion 1.0.0
 * @apiDescription Ajoute une discussion à un "Livre du Jour" spécifique.
 *
 * @apiParam {String} bookOfDayId ID du livre du jour
 * @apiBody {String} userId ID de l'utilisateur
 * @apiBody {String} content Contenu de la discussion
 * @apiSuccess {Object} discussion Détails de la discussion ajoutée
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     {
 *       "bookOfDayId": "67890",
 *       "userId": "12345",
 *       "content": "Ceci est une discussion."
 *     }
 */
router.post("/livres-du-jour/:bookOfDayId/discussions", async (req, res, next) => {
  const { bookOfDayId } = req.params;
  const { userId, content } = req.body;

  try {
    const discussion = await addDiscussionToBookOfDay(bookOfDayId, userId, content);
    res.status(201).send(discussion);
  } catch (err) {
    next(err);
  }
});

/**
 * @api {get} /api/books/livres-du-jour/:bookOfDayId/discussions Récupérer les discussions d'un livre du jour
 * @apiName GetDiscussionsByBookOfDayFrench
 * @apiGroup LivreDuJour
 * @apiVersion 1.0.0
 * @apiDescription Récupère les discussions associées à un "Livre du Jour" spécifique.
 *
 * @apiParam {String} bookOfDayId ID du livre du jour
 * @apiSuccess {Object[]} discussions Liste des discussions
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "userId": "12345",
 *         "content": "Ceci est une discussion."
 *       }
 *     ]
 */
router.get("/livres-du-jour/:bookOfDayId/discussions", async (req, res, next) => {
  const { bookOfDayId } = req.params;

  try {
    const discussions = await getDiscussionsByBookOfDay(bookOfDayId);
    res.status(200).send(discussions);
  } catch (err) {
    next(err);
  }
});



export default router;