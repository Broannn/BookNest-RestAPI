import jwt from 'jsonwebtoken';

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

export function authenticate(req, res, next) {
  // Ensure the header is present.
  const authorization = req.get("Authorization");
  if (!authorization) {
    return res.status(401).send("Authorization header is missing");
  }

  // Check that the header has the correct format.
  const match = authorization.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).send("Authorization header is not a bearer token");
  }
  const secretKey = process.env.JWT_SECRET || 'your_secret_key';
  // Extract and verify the JWT.
  const token = match[1];
  verifyJwt(token, secretKey).then(payload => {
    req.currentUserId = payload.sub; // Pass the ID of the authenticated user to the request.
    next();
  }).catch(() => {
    res.status(401).send("Your token is invalid or has expired");
  });
}
