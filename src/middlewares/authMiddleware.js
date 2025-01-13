import Book from '../models/bookModel.js';

/**
 * Middleware pour vérifier si l'utilisateur est propriétaire de la ressource.
 * @param {String} modelName Nom du modèle MongoDB à vérifier (ex. "Book").
 */
/**
 * Middleware d'autorisation pour vérifier si l'utilisateur connecté est le propriétaire de la ressource.
 *
 * @param {string} modelName - Le nom du modèle à utiliser pour récupérer la ressource (par exemple, 'Book').
 * @returns {Function} Middleware Express pour l'autorisation.
 *
 * @example
 * // Utilisation dans une route Express
 * const { authorizeOwner } = require('./middlewares/authMiddleware');
 * app.get('/books/:id', authorizeOwner('Book'), (req, res) => {
 *   // Logique de la route
 * });
 *
 * @throws {Error} Si le modèle est invalide ou si une erreur se produit lors de la récupération de la ressource.
 */
export const authorizeOwner = (modelName) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params; // ID de la ressource dans l'URL
      const userId = req.user.id; // ID de l'utilisateur connecté (à partir du token JWT)
      
      // Récupérer le modèle dynamique
      const Model = modelName === 'Book' ? Book : null; // Ajoutez d'autres modèles si nécessaire
      if (!Model) {
        return res.status(400).send({ error: 'Invalid model name' });
      }

      // Trouver la ressource
      const resource = await Model.findById(id);
      if (!resource) {
        return res.status(404).send({ error: `${modelName} not found` });
      }

      // Vérifier si l'utilisateur est le propriétaire
      if (resource.user_id.toString() !== userId) {
        return res.status(403).send({ error: 'Forbidden: You do not have permission to access this resource' });
      }

      next(); // Continuer si tout est valide
    } catch (err) {
      console.error('Erreur d\'autorisation :', err);
      next(err);
    }
  };
};

export const authorizeUser = (req, res, next) => {
  const { id } = req.params; // ID de l'utilisateur ciblé
  if (req.currentUserId !== id.toString()) {
    return res.status(403).send({ error: 'Forbidden: You do not have permission to perform this action' });
  }
  next();
};
