
///  CONFIG  ///
const config = {
    port: 80, // used for both websocket and app
    rate_limit: 100, // minimum time (ms) between each request per user 
    database_path: "./src/discbro.db"
}

const stats = {
    gets: 0,
    prev_gets: 0,
    posts: 0,
    prev_posts: 0,
    
    open_sockets: 0,
    prev_open_sockets: 0,
    socket_reqs: 0,
    prev_socket_reqs: 0,

    update_rate: 120 //seconds
}

///  Prerequisites and tests  ///
require('dotenv').config()
const fs = require("fs");

// Check if database is present, if not, create one (.gitignore)
if (!fs.existsSync(config.database_path)) {
    console.log("Database not present, creating one...");
    fs.openSync(config.database_path, "w");

    const database = require("./src/database.js");
    const result = database.setup();

    if (result != 0) {
        fs.unlink(config.database_path, (err) => {
            console.log("Error deleting database file, do it manually instead.");
        });

        throw new Error("Database could net be set up properly. Aborting!");
    }

    console.log("Database sucessfullt initiated.");
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
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // If using HTTPS, set to true
});

const app = express();
app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse urlencoded parameters
app.use(session_parser);

app.all("/app/*", account.check_login); // Make sure no gets or posts happen without being logged in


// Get
app.get("/app/user/:username", page.profile); 
//app.get("/app", page.app);

app.get("/api/get-theme", (req, res) => {
    res.send(JSON.stringify({"theme": "dark-contrast"}));
})


// Post
app.post("/login", account.login); // Allow users to log in, check if the credentials are correct and if they are update session
app.post("/create-account", account.create_account);


// Statistics
app.get("*", (req, res, next) => { stats.gets++; return next(); });
app.post("*", (req, res, next) => { stats.posts++; return next(); });


global.public_path = path.join(__dirname, "public");

// EJS
app.set('views', path.join(global.public_path, "app"));
app.set('view engine','ejs');

// HTTP
const http = require("http");
const server = http.createServer(app);
format.log("server", `HTTP server created.`);

// WebSockets
const WebSocket = require('ws');
global.wss = new WebSocket.Server({ noServer: true });
format.log("server", `WebSocket server created.`);

server.on('upgrade', function (request, socket, head) {
    socket.on('error', console.error);

    session_parser(request, {}, () => {
        if (!request.session.user_id) {
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
    req.session.last_time = Date.now();
    stats.open_sockets++;

    ws.on('message', async (data, isBinary) => {
        // Statistics
        stats.socket_reqs++;

        // Translate
        data = isBinary ? data : data.toString();
        data = JSON.parse(data);

        // Rate limit
        // Doesnt really work, but, good enough for now.
        // Make counter system instead (available requests vs. completed requests, +1 av. every someting)
        //const diff = Date.now() - req.session.last_time;
        //if (diff < config.rate_limit)
        //    await delay(config.rate_limit - diff);
//
        //req.session.last_time = Date.now();

        // Get response and respond with it
        let resp = process_ws_req(data, req, ws);
        resp.req_id = data.req_id;

        return ws.send(JSON.stringify(resp));
    });

    ws.on('close', () => {
        // Handle connection close
        stats.open_sockets--;
    });
});

function process_ws_req(data, req, ws) {
    if (!data.type)
        return {};

    switch (data.type) {
        // Messages (happen most often, so first)
        case "add_message": return websocket.add_message(data, req, ws);
        case "update_message": return;
        case "delete_message": return websocket.delete_message(data, req, ws);

        case "get_messages": return websocket.get_messages(data, req, ws);

        // Roles
        case "add_role": return;
        case "update_role": return;
        case "delete_role": return;

        case "get_roles": return;

        // Channels
        case "add_channel": return websocket.add_channel(data, req, ws);;
        case "update_channel": return websocket.update_channel(data, req, ws);;
        case "delete_channel": return websocket.delete_channel(data, req, ws);;

        case "get_channel": return websocket.get_channel(data, req, ws);
        case "get_channels": return websocket.get_channels(data, req, ws);

        // Server
        case "add_server": return websocket.add_server(data, req, ws);
        case "update_server": return websocket.update_server(data, req, ws);
        case "delete_server": return websocket.delete_server(data, req, ws);

        case "get_server": return websocket.get_server(data, req, ws);
        case "get_servers": return websocket.get_servers(data, req, ws);

        // User
        case "get_user": return websocket.get_user(data, req, ws);

        // Bad request? You get NOTHIN
        default: return {"result": false};
    }
}

// Not found page
app.use("*", (req, res) => {
    if (!fs.existsSync(path.join(global.public_path, req.baseUrl)))
        res.sendFile(path.join(global.public_path, "/util/not-found.html"));
    else
        req.next();
});

// Start server
app.use(express.static(global.public_path));
server.listen(config.port, () => {
    format.log("server", `Server running on 127.0.0.1:${config.port}.`);
});

setInterval(() => {
    // Calcuilate styats
    const sum = stats.gets + stats.posts + stats.socket_reqs;
    const prev_sum = stats.prev_gets + stats.prev_posts + stats.prev_socket_reqs;

    let change_gets = stats.gets - stats.prev_gets;
    let change_posts = stats.posts - stats.prev_posts;
    let change_ws = stats.socket_reqs - stats.prev_socket_reqs;
    let change_sockets = stats.open_sockets - stats.prev_open_sockets;
    let change_sum = sum - prev_sum;

    if (change_gets >= 0) change_gets = "+" + change_gets;
    if (change_posts >= 0) change_posts = "+" + change_posts;
    if (change_ws >= 0) change_ws = "+" + change_ws;
    if (change_sockets >= 0) change_sockets = "+" + change_sockets;
    if (change_sum >= 0) change_sum = "+" + change_sum;

    // Print stats
    console.log(`
Total requests
    GETs:    ${stats.gets} [${change_gets}]
    POSTs:   ${stats.posts} [${change_posts}]
    WS:      ${stats.socket_reqs} [${change_ws}]
    Sockets: ${stats.open_sockets} [${change_sockets}]

    Sum:     ${sum} [${change_sum}]
    `);

    // Update prev
    stats.prev_gets = stats.gets;
    stats.prev_posts = stats.posts;
    stats.prev_socket_reqs = stats.socket_reqs;
    stats.prev_open_sockets = stats.open_sockets;
}, stats.update_rate * 1000) // every rate seconds

// move to different file
const delay = ms => new Promise(res => setTimeout(res, ms));