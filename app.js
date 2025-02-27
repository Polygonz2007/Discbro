
///  CONFIG  ///
const config = {
    port: { websocket: 2337, app: 2338 }, // used for both websocket and app
}


///  IMPORT  ///
const format = require("./src/format.js");
const database = require("./src/database.js");
const account = require("./src/account.js");
const page = require("./src/page.js");
const websocket = require("./src/websocket.js");


///  SETUP  ///
// Express + routing
const express = require("express");
const session = require("express-session");
const path = require("path");

const session_parser = session({
    secret: 'mad_secret_bro',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // If using HTTPS, set to true
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse urlencoded parameters
app.use(session_parser);

app.all("/app/*", account.check_login); // Make sure no gets or posts happen without being logged in

// Get
app.get("/app/user/:userid", page.profile); 
//app.get("/app", page.app);

// Post
app.post("/login", account.login); // Allow users to log in, check if the credentials are correct and if they are update session
app.post("/create-account", account.create_account);

const public_path = path.join(__dirname, "public");

// EJS
app.set('views', path.join(public_path, "app"));
app.set('view engine','ejs');

// HTTP
const http = require("http");
const server = http.createServer(app);

// WebSockets
const WebSocket = require('ws');
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', function (request, socket, head) {
    socket.on('error', console.error);

    console.log("Starting Websocket connection.");

    session_parser(request, {}, () => {
        if (!request.session.userid) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }
    
        socket.removeListener('error', console.error);
    
        wss.handleUpgrade(request, socket, head, function (ws) {
            wss.emit('connection', ws, request);
        });
    });
});

wss.on('connection', (ws, req) => {
    // Send first chunk
    const chunk = database.format_messages(database.get_message_chunk(1));
    ws.send(JSON.stringify(chunk));
    
    ws.on('message', (data, isBinary) => {
        data = isBinary ? data : data.toString();
        data = JSON.parse(data);

        const type = data.type;
        switch (type) {
            case "send": websocket.ws_send(data, req, ws); return;
            case "get": websocket.ws_get(data, req, ws); return;
        }
    });

    ws.on('close', () => {
        // Handle connection close
    });
});

// Start server
app.use(express.static(public_path));
server.listen(config.port.app, () => {
    console.log("Server is running on http://127.0.0.1:" + config.port.app);
});