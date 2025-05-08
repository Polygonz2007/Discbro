
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
const websocket = new WebSocket(url);

// Caches
const servers = {}; // id, name, pic, roles
const channels = {}; // id, name, category, permissions
const users = {}; // id, username, displayname, status, bio / activity
const message_chunks = {};
