import jwt from 'jsonwebtoken';

// Fonction pour vérifier le JWT
const verifyJwt = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

// Middleware d'authentification
export function authenticate(req, res, next) {
  // Vérifie que l'en-tête est présent.
  const authorization = req.get("Authorization");
  if (!authorization) {
    return res.status(401).send("L'en-tête d'autorisation est manquant");
  }

  // Vérifie que l'en-tête a le bon format.
  const match = authorization.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).send("L'en-tête d'autorisation n'est pas un jeton Bearer");
  }
  const secretKey = process.env.JWT_SECRET || 'your_secret_key';
  // Extrait et vérifie le JWT.
  const token = match[1];
  verifyJwt(token, secretKey).then(payload => {
    req.currentUserId = payload.sub; // Passe l'ID de l'utilisateur authentifié à la requête.
    next();
  }).catch(() => {
    res.status(401).send("Votre jeton est invalide ou a expiré");
  });
}
