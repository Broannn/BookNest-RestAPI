import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import Book from '../models/bookModel.js'
import Author from '../models/authorModel.js';
import Genre from '../models/genreModel.js';

const router = express.Router();

const booksToSeed = [
    { title: 'Le Seigneur des Anneaux', author: 'J.R.R. Tolkien', genre: 'Fantastique' },
    { title: 'Harry Potter', author: 'J.K. Rowling', genre: 'Fantastique' },
    { title: 'Le Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantastique' },
    { title: 'A Song of Ice and Fire', author: 'George R.R. Martin', genre: 'Fantastique' },
    { title: 'L\'Assassin Royal', author: 'Robin Hobb', genre: 'Fantastique' },
    { title: 'Chroniques de Narnia', author: 'C.S. Lewis', genre: 'Fantastique' },
    { title: 'La Croisée des Mondes', author: 'Philip Pullman', genre: 'Fantastique' },
    { title: 'Eragon', author: 'Christopher Paolini', genre: 'Fantastique' },
    { title: 'Le Livre Malazéen des glorieux défunts', author: 'Steven Erikson', genre: 'Fantastique' },
    { title: 'American Gods', author: 'Neil Gaiman', genre: 'Fantastique' },
    { title: 'Dune', author: 'Frank Herbert', genre: 'Science-fiction' },
    { title: 'La Guerre des Mondes', author: 'H.G. Wells', genre: 'Science-fiction' },
    { title: 'Fondation', author: 'Isaac Asimov', genre: 'Science-fiction' },
    { title: '1984', author: 'George Orwell', genre: 'Science-fiction' },
    { title: 'Neuromancien', author: 'William Gibson', genre: 'Science-fiction' },
    { title: 'Les Robots', author: 'Isaac Asimov', genre: 'Science-fiction' },
    { title: 'Hyperion', author: 'Dan Simmons', genre: 'Science-fiction' },
    { title: 'Le Guide du voyageur galactique', author: 'Douglas Adams', genre: 'Science-fiction' },
    { title: 'Fahrenheit 451', author: 'Ray Bradbury', genre: 'Science-fiction' },
    { title: 'Snow Crash', author: 'Neal Stephenson', genre: 'Science-fiction' },
    { title: 'Hunger Games', author: 'Suzanne Collins', genre: 'Dystopique' },
    { title: 'Divergente', author: 'Veronica Roth', genre: 'Dystopique' },
    { title: 'Le Meilleur des Mondes', author: 'Aldous Huxley', genre: 'Dystopique' },
    { title: 'La Servante écarlate', author: 'Margaret Atwood', genre: 'Dystopique' },
    { title: 'Battle Royale', author: 'Koushun Takami', genre: 'Dystopique' },
    { title: 'Le Passeur', author: 'Lois Lowry', genre: 'Dystopique' },
    { title: 'Station Eleven', author: 'Emily St. John Mandel', genre: 'Dystopique' },
    { title: 'Les Fils de l’homme', author: 'P.D. James', genre: 'Dystopique' },
    { title: 'Never Let Me Go', author: 'Kazuo Ishiguro', genre: 'Dystopique' },
    { title: 'Metro 2033', author: 'Dmitry Glukhovsky', genre: 'Dystopique' },
    { title: 'L\'île au trésor', author: 'Robert Louis Stevenson', genre: 'Action & Aventure' },
    { title: 'Les Trois Mousquetaires', author: 'Alexandre Dumas', genre: 'Action & Aventure' },
    { title: 'Indiana Jones et la dernière croisade', author: 'Rob MacGregor', genre: 'Action & Aventure' },
    { title: 'Le Comte de Monte-Cristo', author: 'Alexandre Dumas', genre: 'Action & Aventure' },
    { title: 'Jurassic Park', author: 'Michael Crichton', genre: 'Action & Aventure' },
    { title: 'L\'Odyssée', author: 'Homère', genre: 'Action & Aventure' },
    { title: 'Le Tour du monde en 80 jours', author: 'Jules Verne', genre: 'Action & Aventure' },
    { title: 'Vingt mille lieues sous les mers', author: 'Jules Verne', genre: 'Action & Aventure' },
    { title: 'Shogun', author: 'James Clavell', genre: 'Action & Aventure' },
    { title: 'Le Clan des Otori', author: 'Lian Hearn', genre: 'Action & Aventure' },
    { title: 'Sherlock Holmes', author: 'Arthur Conan Doyle', genre: 'Mystère' },
    { title: 'Le Da Vinci Code', author: 'Dan Brown', genre: 'Mystère' },
    { title: 'Les Cinq Petits Cochons', author: 'Agatha Christie', genre: 'Mystère' },
    { title: 'Gone Girl', author: 'Gillian Flynn', genre: 'Mystère' },
    { title: 'La Vérité sur l\'affaire Harry Quebert', author: 'Joël Dicker', genre: 'Mystère' },
    { title: 'Les Gens de Smiley', author: 'John le Carré', genre: 'Mystère' },
    { title: 'Big Little Lies', author: 'Liane Moriarty', genre: 'Mystère' },
    { title: 'L\'Énigme de la chambre 622', author: 'Joël Dicker', genre: 'Mystère' },
    { title: 'Millénium', author: 'Stieg Larsson', genre: 'Mystère' },
    { title: 'Le Silence des Agneaux', author: 'Thomas Harris', genre: 'Thriller & Suspense' },
    { title: 'Shutter Island', author: 'Dennis Lehane', genre: 'Thriller & Suspense' },
    { title: 'Misery', author: 'Stephen King', genre: 'Thriller & Suspense' },
    { title: 'Les Apparences', author: 'Gillian Flynn', genre: 'Thriller & Suspense' },
    { title: 'La Fille du train', author: 'Paula Hawkins', genre: 'Thriller & Suspense' },
    { title: 'Inferno', author: 'Dan Brown', genre: 'Thriller & Suspense' },
    { title: 'L\'Ombre du vent', author: 'Carlos Ruiz Zafón', genre: 'Thriller & Suspense' },
    { title: 'Avant d\'aller dormir', author: 'S.J. Watson', genre: 'Thriller & Suspense' },
    { title: 'Le Poète', author: 'Michael Connelly', genre: 'Thriller & Suspense' },
    { title: 'Intuitions', author: 'Rachel Ward', genre: 'Thriller & Suspense' },
    { title: 'Ça', author: 'Stephen King', genre: 'Horreur' },
    { title: 'Le Fléau', author: 'Stephen King', genre: 'Horreur' },
    { title: 'Dracula', author: 'Bram Stoker', genre: 'Horreur' },
    { title: 'Frankenstein', author: 'Mary Shelley', genre: 'Horreur' },
    { title: 'Les Contes de l’effroi', author: 'Edgar Allan Poe', genre: 'Horreur' },
    { title: 'L\'Exorciste', author: 'William Peter Blatty', genre: 'Horreur' },
    { title: 'The Haunting of Hill House', author: 'Shirley Jackson', genre: 'Horreur' },
    { title: 'L\'Échine du Diable', author: 'Guillermo del Toro', genre: 'Horreur' },
    { title: 'Hex', author: 'Thomas Olde Heuvelt', genre: 'Horreur' },
    { title: 'Bird Box', author: 'Josh Malerman', genre: 'Horreur' },
    { title: 'Orgueil et Préjugés', author: 'Jane Austen', genre: 'Romance' },
    { title: 'Jane Eyre', author: 'Charlotte Brontë', genre: 'Romance' },
    { title: 'Les Hauts de Hurlevent', author: 'Emily Brontë', genre: 'Romance' },
    { title: 'Roméo et Juliette', author: 'William Shakespeare', genre: 'Romance' },
    { title: 'Outlander', author: 'Diana Gabaldon', genre: 'Romance' },
    { title: 'Me Before You', author: 'Jojo Moyes', genre: 'Romance' },
    { title: 'Cinquante nuances de Grey', author: 'E.L. James', genre: 'Romance' },
    { title: 'Love Story', author: 'Erich Segal', genre: 'Romance' },
    { title: 'La Dernière chanson', author: 'Nicholas Sparks', genre: 'Romance' },
    { title: 'À tout jamais', author: 'Nicholas Sparks', genre: 'Romance' }
  ];

router.get('/', async (req, res) => {
  try {
    for (const bookInfo of booksToSeed) {
      const { title, author, genre } = bookInfo;

      // Récupérer les données depuis l'API Google Books
      const { data } = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`);

      const bookItems = data.items || [];
      const bestBook = bookItems.reduce((best, current) => {
        const currentRating = current.volumeInfo.averageRating || 0;
        return currentRating > (best?.volumeInfo?.averageRating || 0) ? current : best;
      }, null);

      if (!bestBook) {
        console.warn(`Aucune donnée trouvée pour le livre : ${title}`);
        continue;
      }

      const bookData = bestBook.volumeInfo;

      // Gérer l'auteur
      let authorRecord = await Author.findOne({ name: bookData.authors ? bookData.authors[0] : author });
      if (!authorRecord) {
        authorRecord = new Author({ name: bookData.authors ? bookData.authors[0] : author });
        await authorRecord.save();
      }

      // Gérer le genre
      let genreRecord = await Genre.findOne({ name: genre });
      if (!genreRecord) {
        genreRecord = new Genre({ name: genre });
        await genreRecord.save();
      }

      // Créer le livre
      const book = new Book({
        title: bookData.title || title,
        author_id: authorRecord._id,
        publication_date: bookData.publishedDate ? new Date(bookData.publishedDate) : new Date(),
        summary: bookData.description || 'Résumé non disponible.',
        cover_image: bookData.imageLinks?.thumbnail || '',
        genres: [genreRecord._id]
      });

      await book.save();
    }

    res.status(201).json({ message: 'Données seedées avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors du seed des données.', error: error.message });
  }
});

export default router;
