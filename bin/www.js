#!/usr/bin/env node

import * as apiDoc from 'apidoc';
import debugFactory from 'debug';
import http from 'http';
import path from 'path';
import app from '../app.js';
import * as config from '../config.js';




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