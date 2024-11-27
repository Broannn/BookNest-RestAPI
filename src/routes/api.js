import express from 'express';

import * as config from '../../config.js';

const router = express.Router();

router.get('/', (req, res) =>
  res.send({
    title: 'BookNest REST API',
    version: config.version,
    authors: config.madeBy,
    docs: `${config.baseUrl}/docs}`
  })
);

export default router;