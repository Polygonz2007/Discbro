
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

// Variables accessible from other scripts
let ready_resolve, ready_reject;
export let ready = new Promise((resolve, reject) => { 
    ready_resolve = resolve;
    ready_reject = reject;
});

export let current_req_id = 0;
export let reqs = [];
export let successes = 0;


// Caches
const servers = {}; // id, name, pic, roles
const channels = {}; // id, name, category, permissions
const users = {}; // id, username, displayname, status, bio / activity
const message_chunks = {};

// Imports
import * as page from "./page.js";

// Receive requests
socket.addEventListener("open", async (event) => {
    // Startup
    ready_resolve();
});

socket.addEventListener("message", (event) => {
    // Parse and get data
	const data = JSON.parse(event.data);
	console.log(data);

    // Check if it is our request or request from server
    if (data.req_id) {

        // We made this request, figure out what we did and do based of that
        const req_id = data.req_id;
        let req, req_pos;

        // Find our beloved request
        for (let i = 0; i < reqs.length; i++) {
            if (reqs[i].req_id == req_id) {
                req = reqs[i];
                req_pos = i;
            }
        }

        if (!req)
            return false;

        // Log time taken
        const after = Date.now();
        console.log(`Request #${req.req_id} [${req.type}]\nTrip time: ${after - req.time_sent}ms`);

        // Do it
        req.resolve(data);

        // Remove request because it succeded
        reqs.splice(req_pos, 1);
        return true;
    
    } else {

        // Server is telling us something, listen and execute based off what it is
        const type = data.type;
        switch (type) {
            case "message_added":
                // Add the message if in same channel as us
                if (data.channel_id != window.app.state.channel)
                    return false; // In future, show as notif in that channel / server

                page.create_message(data.messages[0]);

                return true;
        }

    }
});


// Functions to make requests and parse them
export function ws_req(type, parameters) {
    // Create what we send
    if (!type)
        return;

    if (!parameters)
        parameters = {};

    parameters.type = type;

    // Create ID for this request
    current_req_id++;
    const req_id = current_req_id;

    parameters.req_id = req_id;

    // Send!
    const payload = JSON.stringify(parameters);
    socket.send(payload);

    // Make promise for result, add the req
    return new Promise((resolve, reject) => {
        // And add the req to buffer
        reqs.push({
            req_id: req_id,
            type: type,
            time_sent: Date.now(),

            resolve: resolve,
            reject: reject
        });
    });
}