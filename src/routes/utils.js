import formatLinkHeader from 'format-link-header';

import { authToken, baseUrl } from '../../config.js';

/**
 * Répond avec 415 Unsupported Media Type si la requête n'a pas le Content-Type application/json.
 */
export function requireJson(req, res, next) {
  if (req.is('application/json')) {
    return next();
  }

  const error = new Error('Cette ressource n\'a qu\'une représentation application/json');
  error.status = 415; // 415 Unsupported Media Type
  next(error);
}

/**
 * Analyse les paramètres de pagination (c'est-à-dire page et taille de page) à partir de la requête.
 *
 * @param {ExpressRequest} req - L'objet de requête Express
 * @returns Un objet contenant les propriétés "page" et "pageSize"
 */
export function getPaginationParameters(req) {
  // Analyse le paramètre "page" de l'URL indiquant l'index du premier élément dans la réponse
  let page = parseInt(req.query.page, 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  // Analyse le paramètre "pageSize" de l'URL indiquant combien d'éléments doivent être inclus dans la réponse
  let pageSize = parseInt(req.query.pageSize, 10);
  if (isNaN(pageSize) || pageSize < 0 || pageSize > 100) {
    pageSize = 100;
  }

  return { page, pageSize };
}

/**
 * Ajoute un en-tête Link à la réponse (si applicable).
 *
 * @param {String} resourceHref - Le lien hypertexte de la collection (ex. "/api/people")
 * @param {Number} page - La page en cours d'affichage
 * @param {Number} pageSize - La taille de la page
 * @param {Number} total - Le nombre total d'éléments
 * @param {ExpressResponse} res - L'objet de réponse Express
 */
export function addLinkHeader(resourceHref, page, pageSize, total, res) {
  const links = {};
  const url = baseUrl + resourceHref;
  const maxPage = Math.ceil(total / pageSize);

  // Ajoute les liens "first" et "prev" si la page actuelle n'est pas la première
  if (page > 1) {
    links.first = { rel: 'first', url: `${url}?page=1&pageSize=${pageSize}` };
    links.prev = { rel: 'prev', url: `${url}?page=${page - 1}&pageSize=${pageSize}` };
  }

  // Ajoute les liens "next" et "last" si la page actuelle n'est pas la dernière
  if (page < maxPage) {
    links.next = { rel: 'next', url: `${url}?page=${page + 1}&pageSize=${pageSize}` };
    links.last = { rel: 'last', url: `${url}?page=${maxPage}&pageSize=${pageSize}` };
  }

  // Si des liens existent (c'est-à-dire s'il y a plus d'une page),
  // ajoute l'en-tête Link à la réponse
  if (Object.keys(links).length >= 1) {
    res.set('Link', formatLinkHeader(links));
  }
}

/**
 * Retourne true si la propriété spécifiée est incluse dans les paramètres URL "include" envoyés par le client.
 */
export function responseShouldInclude(req, property) {
  // Récupère le paramètre URL "include"
  let propertiesToInclude = req.query.include;
  if (!propertiesToInclude) {
    return false;
  }

  // Si ce n'est pas un tableau, l'envelopper dans un tableau
  if (!Array.isArray(propertiesToInclude)) {
    propertiesToInclude = [propertiesToInclude];
  }

  // Vérifie si la propriété est dans le tableau
  return propertiesToInclude.indexOf(property) >= 0;
}

/**
 * Middleware qui répond avec 401 Unauthorized si le client n'a pas envoyé un jeton d'authentification bearer
 * égal à la variable d'environnement $AUTH_TOKEN.
 */
export function authenticate(req, res, next) {
  const authorizationHeader = req.get('Authorization');

  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Le jeton d’authentification est manquant' });
  }

  const match = authorizationHeader.match(/^Bearer +(.+)$/);
  if (!match) {
    return res.status(401).json({ error: 'Format d’authentification invalide' });
  }

  const token = match[1];

  try {
    // Remplacez 'your_jwt_secret' par votre clé secrète utilisée pour signer les jetons
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.currentUserId = decoded.id; // Ajoute l'ID utilisateur décodé à la requête
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Jeton invalide ou expiré' });
  }
}

/**
 * @apiDefine Pagination
 * @apiParam (Paramètres de requête URL) {Number{1..}} [page] La page à récupérer (par défaut 1)
 * @apiParam (Paramètres de requête URL) {Number{1..100}} [pageSize] Le nombre d'éléments à récupérer par page (par défaut 100)
 * @apiSuccess (En-têtes de réponse) {String} Link Liens vers les pages première, précédente, suivante et dernière de la collection (si applicable)
 */
