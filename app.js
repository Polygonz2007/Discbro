
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

let connections = [];
let messages = [
    { author: "System", time: "2013", content: "Welcome to Discbro! Be nice pls :)" }
]

wss.on('connection', (ws) => {
    connections.push(ws);
    ws.send(JSON.stringify(messages)); // send history
    
    ws.on('message', (data, isBinary) => {
        data = isBinary ? data : data.toString();
        data = JSON.parse(data);

        // Handle incoming message
        const time = new Date().toLocaleString();

        const result = { "author": data.author, "time": time, "content": data.content };

        messages.push(result);
        for (let i = 0; i < connections.length; i++) {
            connections[i].send(JSON.stringify([result]));
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