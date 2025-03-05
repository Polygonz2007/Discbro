
const database = require("./database.js");
const format = require("./format.js");

///  FUNCTIONS  ///
// Message sent by client
function send_message(data, req) {
    // Get and check author of
    const user = database.get_user_info(req.session.user_id);
    data.author_id = user.id;
    if (!data.author_id)
        return false;

    // Sanetize
    //data.content = format.escape_html(data.content);
    data.content = format.links(data.content);

    // Store in database
    const message_id = database.new_message(data.channel_id, data.author_id, data.content);
    if (!message_id)
        return;

    // Share new message with all connected clients (IN THIS CHANNEL) (OH NO)
    const messages = database.format_messages(database.get_message(message_id), req.session.user_id);
    global.wss.clients.forEach((client) => {
        client.send(JSON.stringify({ "type": "message", "channel_id": data.channel_id, "dir": true, "messages": messages }));
    });
}

// Get a chunk of messages
function get_chunk(data, req, ws) {
    // Get messages, if there are none tell client we are up to date, if not send the messages
    let messages = database.get_message_chunk(data.channel_id, data.dir, data.last_id, data.chunk_s);
    if (!messages)
        messages = [];
    else
        messages = database.format_messages(messages, req.session.user_id);

    ws.send(JSON.stringify({
        "type": "chunk",
        "channel_id": data.channel_id,
        "dir": data.dir,
        "messages": messages,
        "up_to_date": messages.length == 0 || data.last_id == null
    }));
}

function get_channels(data, req, ws) {
    const channels = database.get_channels();
}

function get_channel(data, req, ws) {

}

module.exports = {
    send_message,

    get_chunk,
    get_channels,
    get_channel
}