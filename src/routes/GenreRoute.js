import express from 'express';
import Genre from '../models/genreModel.js'; // Assurez-vous que le chemin est correct
import * as utils from './utils.js'; // Inclure vos utilitaires si nécessaire
import * as config from '../../config.js'; // Inclure la configuration si nécessaire
import debugLib from 'debug';

const debug = debugLib('app:genres');
const router = express.Router();

/**
 * @api {post} /api/genres Créer un genre
 * @apiName CreerGenre
 * @apiGroup Genre
 * @apiVersion 1.0.0
 * @apiDescription Enregistre un nouveau genre dans le système.
 *
 * @apiBody {String} name Le nom du genre
 * @apiSuccess (Corps de réponse) {String} id Un identifiant unique pour le genre
 * @apiSuccessExample {json} 201 Créé
 *     HTTP/1.1 201 Créé
 *     Content-Type: application/json
 *     Location: https://example.com/api/genres/12345
 *
 *     {
 *       "id": "12345",
 *       "name": "Science-fiction",
 *       "createdAt": "2025-01-13T10:00:00.000Z"
 *     }
 */
router.post('/', utils.requireJson, (req, res, next) => {
  new Genre(req.body)
    .save()
    .then(createdGenre => {
      debug(`Genre créé "${createdGenre.name}"`);
      res
        .status(201)
        .set('Location', `${config.baseUrl}/api/genres/${createdGenre._id}`)
        .send(createdGenre);
    })
    .catch(next);
});

/**
 * @api {get} /api/genres Récupérer tous les genres
 * @apiName ObtenirGenres
 * @apiGroup Genre
 * @apiVersion 1.0.0
 * @apiDescription Récupère la liste de tous les genres disponibles.
 *
 * @apiSuccess (Corps de réponse) {Object[]} genres Liste des genres
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     [
 *       {
 *         "id": "12345",
 *         "name": "Science-fiction",
 *         "createdAt": "2025-01-13T10:00:00.000Z"
 *       },
 *       {
 *         "id": "67890",
 *         "name": "Fantasy",
 *         "createdAt": "2025-01-12T10:00:00.000Z"
 *       }
 *     ]
 */
router.get('/', (req, res, next) => {
  Genre.find()
    .then(genres => {
      res.status(200).send(genres);
    })
    .catch(next);
});

/**
 * @api {get} /api/genres/:id Récupérer un genre par ID
 * @apiName ObtenirGenreParId
 * @apiGroup Genre
 * @apiVersion 1.0.0
 * @apiDescription Récupère un genre spécifique grâce à son ID unique.
 *
 * @apiParam {String} id L'ID du genre
 * @apiSuccess (Corps de réponse) {String} id L'identifiant unique du genre
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *       "id": "12345",
 *       "name": "Science-fiction",
 *       "createdAt": "2025-01-13T10:00:00.000Z"
 *     }
 * @apiError 404 Genre non trouvé
 */
router.get('/:id', (req, res, next) => {
  Genre.findById(req.params.id)
    .then(genre => {
      if (!genre) {
        return res.status(404).send({ error: 'Genre non trouvé' });
      }
      res.status(200).send(genre);
    })
    .catch(next);
});

/**
 * @api {put} /api/genres/:id Mettre à jour un genre
 * @apiName MettreAJourGenre
 * @apiGroup Genre
 * @apiVersion 1.0.0
 * @apiDescription Met à jour les détails d'un genre existant.
 *
 * @apiParam {String} id L'ID du genre
 * @apiBody {String} name Le nouveau nom du genre
 * @apiSuccess (Corps de réponse) {String} id L'identifiant unique du genre mis à jour
 * @apiSuccessExample {json} 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *       "id": "12345",
 *       "name": "Fantastique",
 *       "updatedAt": "2025-01-14T10:00:00.000Z"
 *     }
 * @apiError 404 Genre non trouvé
 */
router.put('/:id', utils.requireJson, (req, res, next) => {
  Genre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .then(updatedGenre => {
      if (!updatedGenre) {
        return res.status(404).send({ error: 'Genre non trouvé' });
      }
      debug(`Genre mis à jour "${updatedGenre.name}"`);
      res.status(200).send(updatedGenre);
    })
    .catch(next);
});

/**
 * @api {delete} /api/genres/:id Supprimer un genre
 * @apiName SupprimerGenre
 * @apiGroup Genre
 * @apiVersion 1.0.0
 * @apiDescription Supprime un genre grâce à son ID.
 *
 * @apiParam {String} id L'ID du genre à supprimer
 * @apiSuccessExample {json} 204 Aucun contenu
 *     HTTP/1.1 204 Aucun contenu
 * @apiError 404 Genre non trouvé
 */
router.delete('/:id', (req, res, next) => {
  Genre.findByIdAndDelete(req.params.id)
    .then(deletedGenre => {
      if (!deletedGenre) {
        return res.status(404).send({ error: 'Genre non trouvé' });
      }
      debug(`Genre supprimé "${deletedGenre.name}"`);
      res.status(204).send();
    })
    .catch(next);
});

export default router;
