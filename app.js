import bodyParser from "body-parser";
import express from "express";
import logger from "morgan";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import * as config from "./config.js"; // Configuration
import rootApi from "./src/routes/api.js"; // Routes principales
import adminRoutes from "./src/routes/admin.js"; // Routes d'administration
import bookRoutes from "./src/routes/BookRoute.js"; // Routes pour les livres
import genreRoutes from "./src/routes/GenreRoute.js"; // Routes pour les genres
import userRoutes from "./src/routes/UserRoute.js"; // Routes pour les utilisateurs
import authRoutes from "./src/routes/AuthorRoute.js"; // Routes pour l'authentification
import seederRoutes from "./src/routes/Seeder.js"; // Routes pour l'authentification

// Connexion à MongoDB
await mongoose.connect(config.databaseUrl);

if (config.debug) {
  mongoose.set("debug", true);
}

const app = express();

// Configuration de la vue
app.set("views", path.join(config.projectRoot, "views"));
app.set("view engine", "pug");

// Middlewares généraux
if (config.env !== "test") {
  app.use(logger("dev"));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes API
app.use("/api", rootApi);
app.use("/api/books", bookRoutes); // Routes pour les livres
app.use("/api/genres", genreRoutes); // Routes pour les genres
app.use("/api/users", userRoutes); // Routes pour les utilisateurs
app.use("/api/authors", authRoutes); // Routes pour les auteurs
app.use("/api/seeds", seederRoutes); // Routes pour inséré des données

// Routes d'administration
app.use("/admin", adminRoutes);
// Parse the OpenAPI document.

const openApiDocument = yaml.load(fs.readFileSync("./openapi.yml"));

// Serve the Swagger UI documentation.
app.use("/openapi", swaggerUi.serve, swaggerUi.setup(openApiDocument));

// Define __dirname for ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));

// Route pour la page d'accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "docs.html"));
});
// Serve the apiDoc documentation.
app.use("/apidoc", express.static(path.join(__dirname, "docs")));

// Gestion des erreurs 404
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Gestion des erreurs API (JSON)
app.use("/api", function (err, req, res, next) {
  // Log de l'erreur
  console.warn(err);

  // Validation error (code 422)
  if (err.name == "ValidationError" && !err.status) {
    err.status = 422;
  }

  res.status(err.status || 500);

  const response = {
    message: err.message,
  };

  if (err.status == 422) {
    response.errors = err.errors;
  }

  res.send(response);
});

// Gestion des erreurs génériques (HTML)
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

export default app;
