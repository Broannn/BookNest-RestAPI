import express from 'express';
import mongoose from 'mongoose';
import * as utils from './utils.js';

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