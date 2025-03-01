
const database = require("./database.js");
const format = require("./format.js");

///  FUNCTIONS  ///
// Message sent by client
function ws_send(data, req) {
    // Get and check author of
    const user = database.get_user_info(req.session.userid);
    data.author = user.username;
    if (!data.author)
        data.author = "Anonymous User";

    // Sanetize
    data.content = format.escape_html(data.content);

    // Store in database
    const message_id = database.new_message(1, user.id, data.content);
    if (!message_id)
        return;

    // Share new message with all connected clients (IN THIS CHANNEL) (OH NO)
    const messages = database.format_messages(database.get_message(message_id));
    global.wss.clients.forEach((client) => {
        client.send(JSON.stringify({ "type": "message", "dir": true, "messages": messages }));
    });
}

// Get a chunk of messages
function ws_get(data, req, ws) {
    let messages = database.get_message_chunk(data.channel_id, data.dir, data.last_id, data.chunk_s);
    if (!messages)
        return ws.send(JSON.stringify({ "type": "chunk", "dir": data.dir, "messages": [] }));

    messages = database.format_messages(messages);
    ws.send(JSON.stringify({ "type": "chunk", "dir": data.dir, "messages": messages }));
}

module.exports = {
    ws_send,
    ws_get
}