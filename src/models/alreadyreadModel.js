import mongoose from 'mongoose';

/**
 * Schéma Mongoose pour les livres déjà lus par un utilisateur.
 * 
 * @typedef {Object} AlreadyRead
 * @property {mongoose.Schema.Types.ObjectId} user_id - Référence à l'utilisateur qui a lu le livre. Obligatoire.
 * @property {mongoose.Schema.Types.ObjectId} book_id - Référence au livre qui a été lu. Obligatoire.
 * @property {Date} createdAt - Date de création de l'entrée. Gérée automatiquement par Mongoose.
 * @property {Date} updatedAt - Date de la dernière mise à jour de l'entrée. Gérée automatiquement par Mongoose.
 */
const alreadyReadSchema = new mongoose.Schema({
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
  
  export default mongoose.model('AlreadyRead', alreadyReadSchema);