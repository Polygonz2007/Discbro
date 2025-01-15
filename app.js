
///  CONFIG  ///
const config = {
    port: { websocket: 2337, app: 2338 }, // used for both websocket and app
}

///  SETUP  ///
// Express + routing
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse urlencoded parameters

const public_path = path.join(__dirname, "public");

// WebSockets
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: config.port.websocket });

let number = 0;
let connections = [];

wss.on('connection', (ws) => {
    connections.push(ws);
        
    ws.on('message', (message) => {
        // Handle incoming message
        number++;
        for (let i = 0; i < connections.length; i++) {
            connections[i].send(number);
        }
    });

    ws.on('close', () => {
        // Handle connection close
    });
});

// Start server
app.use(express.static(public_path));
app.listen(config.port.app, () => {
    console.log("Server is running on http://127.0.0.1:" + config.port.app)
});