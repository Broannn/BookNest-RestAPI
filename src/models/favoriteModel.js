/**
 * Modèle Mongoose pour les favoris.
 * 
 * @module models/favoriteModel
 */

import mongoose from 'mongoose';

/**
 * Schéma Mongoose pour un favori.
 * 
 * @typedef {Object} Favorite
 * @property {mongoose.Schema.Types.ObjectId} user_id - Référence à l'utilisateur qui a ajouté le favori.
 * @property {mongoose.Schema.Types.ObjectId} book_id - Référence au livre ajouté en favori.
 * @property {Date} createdAt - Date de création du favori.
 * @property {Date} updatedAt - Date de la dernière mise à jour du favori.
 */

const favoriteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Favorite', favoriteSchema);