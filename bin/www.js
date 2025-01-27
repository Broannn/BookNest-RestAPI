#!/usr/bin/env node

import * as apiDoc from 'apidoc';
import debugFactory from 'debug';
import http from 'http';
import path from 'path';
import app from '../app.js';
import * as config from '../config.js';
import { WebSocketServer } from 'ws';
import http from 'http';



const debug = debugFactory('officiel:server');

// Generate apiDoc documentation on startup.
const docsDest = path.join(config.projectRoot, 'docs');
apiDoc.createDoc({
    src: [path.join(config.projectRoot, 'src/routes')],
    dest: docsDest
});
debug(`Generated apiDoc documentation into ./${path.relative(config.projectRoot, docsDest)}`);

// Get port from environment and store in Express
const port = normalizePort(config.port);
app.set('port', port);

// Create HTTP server
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

// Stocker les connexions WebSocket par livre
const connections = {};

// Configurer le WebSocket pour gérer les connexions et les messages
wss.on("connection", (ws, req) => {
  try {
    // Extraire l'ID du livre à partir de l'URL de connexion
    const url = new URL(req.url, `http://${req.headers.host}`);
    const bookId = url.pathname.split("/")[3]; // /api/books/:bookId/critiques

    if (!bookId) {
      ws.close();
      console.log("Connexion WebSocket fermée : bookId manquant.");
      return;
    }

    // Ajouter la connexion pour le livre
    if (!connections[bookId]) connections[bookId] = [];
    connections[bookId].push(ws);
    console.log(`Connexion WebSocket établie pour le livre ${bookId}`);

    // Gérer les messages envoyés par le client
    ws.on("message", (data) => {
      console.log(`Message reçu pour le livre ${bookId} :`, data);

      // Diffuser le message à tous les clients connectés à ce livre
      connections[bookId].forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data); // Répandre le message aux autres clients
        }
      });
    });

    // Supprimer la connexion lorsqu'elle est fermée
    ws.on("close", () => {
      connections[bookId] = connections[bookId].filter((client) => client !== ws);
      console.log(`Connexion WebSocket fermée pour le livre ${bookId}`);
    });

    // Gérer les erreurs
    ws.on("error", (error) => {
      console.error(`Erreur WebSocket pour le livre ${bookId} :`, error);
    });
  } catch (error) {
    console.error("Erreur lors de la configuration de WebSocket :", error);
    ws.close();
  }
});

// Listen on provided port, on all network interfaces
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const parsedPort = parseInt(val, 10);

    if (isNaN(parsedPort)) {
        // named pipe
        return val;
    }

    if (parsedPort >= 0) {
        // port number
        return parsedPort;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
}