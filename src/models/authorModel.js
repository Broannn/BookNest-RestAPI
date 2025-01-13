import mongoose from 'mongoose';

// Schéma
// Définition du schéma pour les auteurs
/**
 * Schéma Mongoose pour le modèle Author.
 * 
 * @typedef {Object} Author
 * @property {String} name - Le nom de l'auteur. Ce champ est requis, doit être une chaîne de caractères, 
 *                           sans espaces en début et fin de chaîne, et avec une longueur maximale de 250 caractères.
 * @property {Date} birth_date - La date de naissance de l'auteur.
 * 
 * @property {Date} createdAt - La date de création de l'enregistrement. Ajoutée automatiquement par Mongoose.
 * @property {Date} updatedAt - La date de dernière mise à jour de l'enregistrement. Ajoutée automatiquement par Mongoose.
 */
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Le nom est requis
    trim: true, // Supprime les espaces en début et fin de chaîne
    maxlength: 250 // Longueur maximale de 250 caractères
  },
  birth_date: {
    type: Date // Date de naissance de l'auteur
  }
}, { timestamps: true }); // Ajoute les champs createdAt et updatedAt

// Modèle
// Création du modèle Author basé sur le schéma authorSchema
export default mongoose.model('Author', authorSchema);