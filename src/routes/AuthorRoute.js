import express from 'express';
import Author from '../models/authorModel.js'; // Assurez-vous que le chemin est correct
import * as utils from './utils.js'; // Inclure vos utilitaires si nécessaire
import * as config from '../../config.js'; // Inclure la configuration si nécessaire
import debugLib from 'debug';

const debug = debugLib('app:authors');
const router = express.Router();

// CREATE (POST)
router.post('/', utils.requireJson, (req, res, next) => {
  new Author(req.body)
    .save()
    .then(createdAuthor => {
      debug(`Created author "${createdAuthor.name}"`);
      return createdAuthor;
    })
    .then(createdAuthor => {
      res
        .status(201)
        .set('Location', `${config.baseUrl}/api/authors/${createdAuthor._id}`)
        .send(createdAuthor);
    })
    .catch(next);
});

// READ ALL (GET)
router.get('/', (req, res, next) => {
  Author.find()
    .then(authors => {
      res.status(200).send(authors);
    })
    .catch(next);
});

// READ ONE (GET by ID)
router.get('/:id', (req, res, next) => {
  Author.findById(req.params.id)
    .then(author => {
      if (!author) {
        return res.status(404).send({ error: 'Author not found' });
      }
      res.status(200).send(author);
    })
    .catch(next);
});

// UPDATE (PUT)
router.put('/:id', utils.requireJson, (req, res, next) => {
  Author.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .then(updatedAuthor => {
      if (!updatedAuthor) {
        return res.status(404).send({ error: 'Author not found' });
      }
      debug(`Updated author "${updatedAuthor.name}"`);
      res.status(200).send(updatedAuthor);
    })
    .catch(next);
});

// DELETE (DELETE)
router.delete('/:id', (req, res, next) => {
  Author.findByIdAndDelete(req.params.id)
    .then(deletedAuthor => {
      if (!deletedAuthor) {
        return res.status(404).send({ error: 'Author not found' });
      }
      debug(`Deleted author "${deletedAuthor.name}"`);
      res.status(204).send(); // No content
    })
    .catch(next);
});

export default router;
