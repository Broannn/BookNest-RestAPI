/**
 * Routeur Express pour les opérations d'administration.
 * @module routes/admin
 */

import express from 'express';
import mongoose from 'mongoose';
import * as utils from './utils.js';

/**
 * Réinitialise toutes les collections de la base de données MongoDB.
 * @function reset
 * @returns {Promise<void>} Une promesse qui se résout lorsque toutes les collections sont réinitialisées.
 */

/**
 * Route POST pour réinitialiser la base de données.
 * @name /reset
 * @function
 * @memberof module:routes/admin
 * @inner
 * @param {express.Request} req - L'objet de requête Express.
 * @param {express.Response} res - L'objet de réponse Express.
 * @param {express.NextFunction} next - La fonction middleware suivante dans la chaîne.
 */

const router = express.Router();

router.post('/reset', utils.authenticate, function (req, res, next) {
    reset()
        .then(() => res.sendStatus(204))
        .catch(next);
});

function reset() {
    const collections = mongoose.connection.collections;
    const promises = [];

    for (const key in collections) {
        if (collections.hasOwnProperty(key)) {
            promises.push(collections[key].deleteMany({}));
        }
    }

    return Promise.all(promises);
}

export default router;