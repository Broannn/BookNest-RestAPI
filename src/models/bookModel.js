/**
 * Schéma de livre pour MongoDB utilisant Mongoose.
 * 
 * @typedef {Object} Book
 * @property {string} title - Le titre du livre. Requis, maximum 250 caractères.
 * @property {mongoose.Schema.Types.ObjectId} author_id - Référence à l'auteur du livre. Requis.
 * @property {Date} publication_date - La date de publication du livre. Requis.
 * @property {string} summary - Un résumé du livre. Requis.
 * @property {string} [cover_image] - URL de l'image de couverture du livre.
 * @property {mongoose.Schema.Types.ObjectId[]} genres - Liste des genres associés au livre.
 * @property {Date} createdAt - Date de création du document. Géré automatiquement par Mongoose.
 * @property {Date} updatedAt - Date de mise à jour du document. Géré automatiquement par Mongoose.
 */

/**
 * Valide un tableau de coordonnées GeoJSON (longitude, latitude et altitude optionnelle).
 * 
 * @function validateGeoJsonCoordinates
 * @param {number[]} value - Tableau de coordonnées à valider.
 * @returns {boolean} - Retourne true si les coordonnées sont valides, sinon false.
 */

/**
 * Vérifie si une valeur est une latitude valide.
 * 
 * @function isLatitude
 * @param {number} value - Valeur à vérifier.
 * @returns {boolean} - Retourne true si la valeur est une latitude valide, sinon false.
 */

/**
 * Vérifie si une valeur est une longitude valide.
 * 
 * @function isLongitude
 * @param {number} value - Valeur à vérifier.
 * @returns {boolean} - Retourne true si la valeur est une longitude valide, sinon false.
 */
import mongoose from 'mongoose';

// Schéma
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 250
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },
  publication_date: {
    type: Date,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  cover_image: {
    type: String
  },
  // location: {
  //   type: {
  //     type: String,
  //     required: true,
  //     enum: [ 'Point' ]
  //   },
  //   coordinates: {
  //     type: [ Number ],
  //     required: true,
  //     validate: {
  //       validator: validateGeoJsonCoordinates,
  //       message: '{VALUE} is not a valid longitude/latitude(/altitude) coordinates array'
  //     }
  //   }
  // },
  genres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre'
  }]
}, { timestamps: true });


// Validate a GeoJSON coordinates array (longitude, latitude and optional altitude).
function validateGeoJsonCoordinates(value) {
  return Array.isArray(value) && value.length >= 2 && value.length <= 3 && isLongitude(value[0]) && isLatitude(value[1]);
}

function isLatitude(value) {
  return value >= -90 && value <= 90;
}

function isLongitude(value) {
  return value >= -180 && value <= 180;
}


// Modèle
export default mongoose.model('Book', bookSchema);
