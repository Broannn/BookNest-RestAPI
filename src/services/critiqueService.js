import Critique from '../models/critiqueModel.js';

// Ajouter une critique
export async function addCritique(userId, bookId, rating, comment) {
  try {
    const critique = new Critique({
      user_id: userId,
      book_id: bookId,
      rating,
      comment
    });

    return await critique.save();
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la critique :', err);
    throw err;
  }
}

// Récupérer toutes les critiques pour un livre
export async function getCritiquesByBook(bookId) {
  try {
    return await Critique.find({ book_id: bookId }).populate('user_id', 'username');
  } catch (err) {
    console.error('Erreur lors de la récupération des critiques du livre :', err);
    throw err;
  }
}

// Récupérer la critique d'un utilisateur pour un livre spécifique
export async function getCritiqueByUserAndBook(userId, bookId) {
  try {
    return await Critique.findOne({ user_id: userId, book_id: bookId });
  } catch (err) {
    console.error('Erreur lors de la récupération de la critique de l\'utilisateur :', err);
    throw err;
  }
}

// Mettre à jour une critique
export async function updateCritique(critiqueId, rating, comment) {
  try {
    const critique = await Critique.findById(critiqueId);
    if (!critique) {
      throw new Error('Critique not found');
    }

    critique.rating = rating;
    critique.comment = comment;
    return await critique.save();
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la critique :', err);
    throw err;
  }
}

// Supprimer une critique
export async function deleteCritique(critiqueId) {
  try {
    const critique = await Critique.findById(critiqueId);
    if (!critique) {
      throw new Error('Critique not found');
    }

    await critique.remove();
  } catch (err) {
    console.error('Erreur lors de la suppression de la critique :', err);
    throw err;
  }
}
