import jwt from 'jsonwebtoken';
import { authToken } from '../config.js';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Récupère le token Bearer
  if (!token) {
    return res.status(401).send({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, authToken);
    req.user = decoded; // Ajouter l'utilisateur décodé à la requête
    next();
  } catch (err) {
    res.status(401).send({ error: 'Unauthorized: Invalid token' });
  }
};
