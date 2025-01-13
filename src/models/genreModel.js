/**
 * @file genreModel.js
 * @description Modèle Mongoose pour le schéma de genre.
 */

import mongoose from 'mongoose';

/**
 * Schéma de genre
 * @typedef {Object} Genre
 * @property {String} name - Le nom du genre, requis, sans espaces superflus, longueur maximale de 250 caractères.
 * @property {Date} createdAt - Date de création du document, générée automatiquement par Mongoose.
 * @property {Date} updatedAt - Date de mise à jour du document, générée automatiquement par Mongoose.
 */

// Genre Schema
const genreSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250
    }
  }, { timestamps: true });
  
  export default mongoose.model('Genre', genreSchema);