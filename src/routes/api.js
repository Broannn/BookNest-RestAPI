/**
 * @fileoverview Fichier de définition des routes API pour l'application BookNest.
 * 
 * @module routes/api
 */

import express from 'express';
import * as config from '../../config.js';

const router = express.Router();

/**
 * Route GET pour la racine de l'API.
 * 
 * @name /
 * @function
 * @memberof module:routes/api
 * @inner
 * @param {Object} req - Objet de requête HTTP.
 * @param {Object} res - Objet de réponse HTTP.
 * @returns {void} Renvoie un objet JSON contenant les informations de l'API.
 */
router.get('/', (req, res) =>
  res.send({
    title: 'BookNest REST API',
    version: config.version,
    authors: config.madeBy,
    docs: `${config.baseUrl}/docs}`
  })
);

export default router;