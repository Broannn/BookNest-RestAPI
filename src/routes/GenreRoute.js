import express from 'express';
import Genre from '../models/genreModel.js'; // Assurez-vous que le chemin est correct
import * as utils from './utils.js'; // Inclure vos utilitaires si nécessaire
import * as config from '../../config.js'; // Inclure la configuration si nécessaire
import debugLib from 'debug';

const debug = debugLib('app:genres');
const router = express.Router();

// CREATE (POST)
router.post('/', utils.requireJson, (req, res, next) => {
  new Genre(req.body)
    .save()
    .then(createdGenre => {
      debug(`Created genre "${createdGenre.name}"`);
      res
        .status(201)
        .set('Location', `${config.baseUrl}/api/genres/${createdGenre._id}`)
        .send(createdGenre);
    })
    .catch(next);
});

// READ ALL (GET)
router.get('/', (req, res, next) => {
  Genre.find()
    .then(genres => {
      res.status(200).send(genres);
    })
    .catch(next);
});

// READ ONE (GET by ID)
router.get('/:id', (req, res, next) => {
  Genre.findById(req.params.id)
    .then(genre => {
      if (!genre) {
        return res.status(404).send({ error: 'Genre not found' });
      }
      res.status(200).send(genre);
    })
    .catch(next);
});

// UPDATE (PUT)
router.put('/:id', utils.requireJson, (req, res, next) => {
  Genre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .then(updatedGenre => {
      if (!updatedGenre) {
        return res.status(404).send({ error: 'Genre not found' });
      }
      debug(`Updated genre "${updatedGenre.name}"`);
      res.status(200).send(updatedGenre);
    })
    .catch(next);
});

// DELETE (DELETE)
router.delete('/:id', (req, res, next) => {
  Genre.findByIdAndDelete(req.params.id)
    .then(deletedGenre => {
      if (!deletedGenre) {
        return res.status(404).send({ error: 'Genre not found' });
      }
      debug(`Deleted genre "${deletedGenre.name}"`);
      res.status(204).send(); // No content
    })
    .catch(next);
});

export default router;
