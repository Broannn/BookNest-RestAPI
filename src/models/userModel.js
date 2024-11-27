import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxlength: 50,
    unique: true,
    validate:
    // Manually validate uniqueness to send a "pretty" validation error
    // rather than a MongoDB duplicate key error
    [
      {
        validator: validateUsernameUniqueness,
        message: 'Person {VALUE} already exists'
      }
    ]
  },
  password: {
    type: String,
    required: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    maxlength: 100,
    unique: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Retirer le mot de passe des réponses JSON

/**
 * Transformation du JSON pour nettoyer les données sensibles.
 */
function transformJsonUser(doc, ret) {
  // Supprime les propriétés sensibles ou inutiles
  delete ret.password; // Supprime le mot de passe
  delete ret._id; // Supprime l'ID MongoDB brut
  delete ret.__v; // Supprime la version MongoDB

  return ret; // Retourne l'objet nettoyé
}

// Personnalisation de toJSON
userSchema.set('toJSON', {
  transform: transformJsonUser, // Transformation personnalisée
  virtuals: true // Inclure les propriétés virtuelles
});

/**
 * Validation personnalisée pour garantir l'unicité du nom d'utilisateur
 * tout en évitant les erreurs brutales de MongoDB.
 */
function validateUsernameUniqueness(value) {
  return this.constructor
    .findOne()
    .where('username') // Vérifie le champ 'username'
    .equals(value)
    .exec()
    .then(existingUser => {
      // Valide si aucun utilisateur n'est trouvé, ou si l'utilisateur trouvé est celui en cours de validation
      return !existingUser || existingUser._id.equals(this._id);
    });
}

export default mongoose.model('User', userSchema);
