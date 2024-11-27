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
import { addCritique, getCritiquesByBook, getCritiqueByUserAndBook, updateCritique, deleteCritique } from '../services/critiqueService.js';


const debug = debugLib("app:books");
const router = express.Router();

// CREATE (POST)
router.post("/", utils.requireJson, (req, res, next) => {
  new Book(req.body)
    .save()
    .then((createdBook) => {
      debug(`Created book "${createdBook.title}"`);
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

// READ ALL (GET) avec pagination
router.get("/", (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1; // Page courante
  const limit = parseInt(req.query.limit, 10) || 10; // Nombre d'éléments par page
  const skip = (page - 1) * limit;

  Book.find()
    .populate("author_id genres") // Inclut les relations
    .skip(skip)
    .limit(limit)
    .then((books) => {
      return Book.countDocuments().then((total) => ({
        books,
        total,
        page,
        pages: Math.ceil(total / limit),
      }));
    })
    .then(({ books, total, page, pages }) => {
      res.status(200).send({
        books,
        meta: {
          total,
          page,
          pages,
          limit,
        },
      });
    })
    .catch(next);
});

// READ ONE (GET by ID)
router.get("/:id", (req, res, next) => {
  Book.findById(req.params.id)
    .populate("author_id genres") // Inclut les relations
    .then((book) => {
      if (!book) {
        return res.status(404).send({
          error: "Book not found",
        });
      }
      res.status(200).send(book);
    })
    .catch(next);
});

// UPDATE (PUT)
router.put("/:id", utils.requireJson, (req, res, next) => {
  Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .then((updatedBook) => {
      if (!updatedBook) {
        return res.status(404).send({
          error: "Book not found",
        });
      }
      debug(`Updated book "${updatedBook.title}"`);
      return updatedBook.populate("author_id genres").execPopulate();
    })
    .then((updatedBook) => {
      res.status(200).send(updatedBook);
    })
    .catch(next);
});

// DELETE (DELETE)
router.delete("/:id", (req, res, next) => {
  Book.findByIdAndDelete(req.params.id)
    .then((deletedBook) => {
      if (!deletedBook) {
        return res.status(404).send({
          error: "Book not found",
        });
      }
      debug(`Deleted book "${deletedBook.title}"`);
      res.status(204).send(); // No content
    })
    .catch(next);
});




// Genre du livre

// Ajouter un genre à un livre
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

// Récupérer les genres d'un livre
router.get("/:bookId/genres", async (req, res, next) => {
  const { bookId } = req.params;

  try {
    const genres = await getGenresByBook(bookId);
    res.status(200).send(genres);
  } catch (err) {
    next(err);
  }
});

// Supprimer un genre d'un livre
router.delete("/:bookId/genres/:genreId", async (req, res, next) => {
  const { bookId, genreId } = req.params;

  try {
    const result = await BookGenre.removeGenreFromBook({
      book_id: bookId,
      genre_id: genreId,
    });
    if (!result) {
      return res.status(404).send({
        message: "Book-Genre relationship not found",
      });
    }
    res.status(204).send(); // No content
  } catch (err) {
    next(err);
  }
});




// Livre du jour

// Ajouter un livre du jour
router.post("/", async (req, res, next) => {
  const { bookId, date } = req.body;

  try {
    const bookOfDay = await addBookOfDay(bookId, date);
    res.status(201).send(bookOfDay);
  } catch (err) {
    next(err);
  }
});

// Récupérer les livres du jour
router.get("/", async (req, res, next) => {
  try {
    const booksOfDay = await getBooksOfDay();
    res.status(200).send(booksOfDay);
  } catch (err) {
    next(err);
  }
});

// Ajouter une discussion à un livre du jour
router.post("/:bookOfDayId/discussions", async (req, res, next) => {
  const { bookOfDayId } = req.params;
  const { userId, content } = req.body;

  try {
    const discussion = await addDiscussionToBookOfDay(
      bookOfDayId,
      userId,
      content
    );
    res.status(201).send(discussion);
  } catch (err) {
    next(err);
  }
});

// Récupérer les discussions d'un livre du jour
router.get("/:bookOfDayId/discussions", async (req, res, next) => {
  const { bookOfDayId } = req.params;

  try {
    const discussions = await getDiscussionsByBookOfDay(bookOfDayId);
    res.status(200).send(discussions);
  } catch (err) {
    next(err);
  }
});



// Critique

// Route : Récupérer toutes les critiques pour un livre
router.get('/:bookId/critiques', async (req, res, next) => {
  const { bookId } = req.params;

  try {
    const critiques = await getCritiquesByBook(bookId);
    res.status(200).send(critiques);
  } catch (err) {
    next(err);
  }
});

// Route : Ajouter une critique pour un livre
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

// Route : Récupérer la critique d'un utilisateur pour un livre
router.get('/:bookId/critiques/user/:userId', async (req, res, next) => {
  const { bookId, userId } = req.params;

  try {
    const critique = await getCritiqueByUserAndBook(userId, bookId);
    if (critique) {
      res.status(200).send(critique);
    } else {
      res.status(404).send({ message: 'Critique not found' });
    }
  } catch (err) {
    next(err);
  }
});

// Route : Mettre à jour une critique pour un livre
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

// Route : Supprimer une critique pour un livre
router.delete('/critiques/:critiqueId', async (req, res, next) => {
  const { critiqueId } = req.params;

  try {
    await deleteCritique(critiqueId);
    res.status(204).send(); // 204 No Content
  } catch (err) {
    next(err);
  }
});




// Livres du Jour

// Ajouter un livre du jour
router.post("/livres-du-jour", async (req, res, next) => {
  const { bookId, date } = req.body;

  try {
    const bookOfDay = await addBookOfDay(bookId, date);
    res.status(201).send(bookOfDay);
  } catch (err) {
    next(err);
  }
});

// Récupérer tous les livres du jour
router.get("/livres-du-jour", async (req, res, next) => {
  try {
    const booksOfDay = await getBooksOfDay();
    res.status(200).send(booksOfDay);
  } catch (err) {
    next(err);
  }
});

// Ajouter une discussion à un livre du jour
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

// Récupérer les discussions d'un livre du jour
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
