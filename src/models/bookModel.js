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
  location: {
    type: {
      type: String,
      required: true,
      enum: [ 'Point' ]
    },
    coordinates: {
      type: [ Number ],
      required: true,
      validate: {
        validator: validateGeoJsonCoordinates,
        message: '{VALUE} is not a valid longitude/latitude(/altitude) coordinates array'
      }
    }
  },
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
