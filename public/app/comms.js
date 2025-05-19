
//
//  comms.js (communications.js)
// 
//  This script handles comunication with the server, and handles caching of information.
//  That includes: new messages, updating info in real time, using cached data instead of requesting from server every time.
//
//  When new information is received that needs to be updated, this script calls the appropriate functions from other scripts.
//  For example on new message add_message() is called. If its a chunk being loaded, add_chunk() is called, etc.
//

// WebSockets
const url = `ws://${window.location.host}`;
const socket = new WebSocket(url);
const comms = {
    current_req_id: 0,
    reqs: [],

    successes: 0,

    ws_get: ws_get
}

window.comms = comms;

// Caches
const servers = {}; // id, name, pic, roles
const channels = {}; // id, name, category, permissions
const users = {}; // id, username, displayname, status, bio / activity
const message_chunks = {};

// Imports
import * as page from "./page.js";

// Receive requests
socket.addEventListener("open", (event) => {
    // Startup
    ws_get("get_servers");
});

socket.addEventListener("message", (event) => {
    // Parse and get data
	const data = JSON.parse(event.data);
	console.log(data);

    // Chech with reqs buffer
    if (!data.req_id)
        return false; // No req_id? Invalid!

    const req_id = data.req_id;
    let req, req_pos;

    // Find our beloved request
    for (let i = 0; i < comms.reqs.length; i++) {
        if (comms.reqs[i].req_id == req_id) {
            req = comms.reqs[i];
            req_pos = i;
        }
    }

    if (!req)
        return false;

    // Log time taken
    const after = Date.now();
    console.log(`Request #${req.req_id} [${req.type}]\nTrip time: ${after - req.time_sent}ms`);

    // Now we can cook
	switch (req.type) {
        case "get_servers":
            const servers = data.servers;
            for (let i = 0; i < servers.length; i++) {
                const server = servers[i];
                page.create_server(server.id, server.name, server.image);
            }
            
            return;
    }

    // Remove request because it succeded
    comms.reqs.splice(req_pos, 1);
    return true;
});


// Functions to make requests and parse them
function ws_get(type, parameters) {
    // Create what we send
    if (!type)
        return;

    if (!parameters)
        parameters = {};

    parameters.type = type;

    // Create ID for this request
    comms.current_req_id++;
    const req_id = comms.current_req_id;

    parameters.req_id = req_id;
    comms.reqs.push({
        req_id: req_id,
        type: type,
        time_sent: Date.now()
    });

    // Send!
    const payload = JSON.stringify(parameters);
    socket.send(payload);
    return true;
}