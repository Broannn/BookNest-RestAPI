/**
 * Modèle de critique pour MongoDB utilisant Mongoose.
 * 
 * @module models/critiqueModel
 */

import mongoose from 'mongoose';

/**
 * Schéma de critique.
 * 
 * @typedef {Object} Critique
 * @property {mongoose.Schema.Types.ObjectId} user_id - Référence à l'utilisateur qui a fait la critique.
 * @property {mongoose.Schema.Types.ObjectId} book_id - Référence au livre critiqué.
 * @property {number} rating - Note attribuée au livre, entre 1 et 5.
 * @property {string} comment - Commentaire de l'utilisateur sur le livre.
 * @property {Date} createdAt - Date de création de la critique.
 * @property {Date} updatedAt - Date de la dernière mise à jour de la critique.
 */

/**
 * Assure une critique unique par utilisateur et par livre.
 * 
 * @function
 * @name critiqueSchema.index
 * @param {Object} fields - Champs à indexer.
 * @param {Object} options - Options d'indexation.
 * @param {number} options.unique - Assure l'unicité de la combinaison des champs indexés.
 */

/**
 * Modèle de critique.
 * 
 * @typedef {mongoose.Model<Critique>} CritiqueModel
 */


// Schéma
const critiqueSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Assurer une critique unique par utilisateur et par livre
critiqueSchema.index({ user_id: 1, book_id: 1 }, { unique: true });

// Modèle
export default mongoose.model('Critique', critiqueSchema);
