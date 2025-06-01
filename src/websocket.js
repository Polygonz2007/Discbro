
const database = require("./database.js");
const format = require("./format.js");

///  FUNCTIONS  ///
// Message sent by client
function add_message(data, req) {
    // Get and check author of
    const user = database.get_user_info(req.session.user_id);
    data.author_id = user.id;
    if (!data.author_id)
        return false;

    // Check that the user has access to channel
    

    // Sanetize
    //data.content = format.escape_html(data.content);
    
    // Store in database
    const message_id = database.add_message(data.channel_id, data.author_id, data.content);
    if (!message_id)
        return;

    // Share new message with all connected clients (IN THIS CHANNEL) (OH NO)
    const messages = database.format_messages([database.get_message(message_id)], req.session.user_id);
    global.wss.clients.forEach((client) => {
        client.send(JSON.stringify({ "type": "message_added", "channel_id": data.channel_id, "dir": true, "messages": messages }));
    });

    return {};
}

function update_message(data, req, ws) {
    return;
}

function delete_message(data, req, ws) {
    // Get message to be deleted
    const message_id = data.message_id;
    const message = database.get_message(message_id);
    console.log(message)
    console.log(message.author_id)

    console.log("Deleting message " + message_id)

    // Get and check perms
    if (message.author_id != req.session.user_id) // || !check_perms(user.id, "admin")
        return false;

    database.delete_message(message_id);
    return {"state": "success"};
}

// Get a chunk of messages
function get_messages(data, req, ws) {
    console.log(data)

    // Get messages, if there are none tell client we are up to date, if not send the messages
    let messages = database.get_messages(data.channel_id, data.amount, data.anchor, data.direction);
    if (!messages)
        messages = [];
    else
        messages = database.format_messages(messages, req.session.user_id);

    return {
        "channel_id": data.channel_id,
        "direction": data.dir,
        "messages": messages,
        "up_to_date": messages.length == 0 || data.anchor == null
    };
}


/// CHANNELS ///
function add_channel(data, req, ws) {
    return 0;
}

function update_channel(data, req, ws) {
    return 0;
}

function delete_channel(data, req, ws) {
    return 0;
}

function get_channels(data, req, ws) {
    const channels = database.get_channels(data.server_id);
    
    return {"channels": channels};
}

function get_channel(data, req, ws) {
    const channel = database.get_channels();

    return {
        "id": channel.id,
        "name": channel.name
    };
}


/// SERVERS ///
function add_server(data, req, ws) {
    // Get user
    const user_id = req.session.user_id;

    // Add the server
    const result = database.add_server(user_id, data.name, "");

    return {"result": result};
}

function update_server(data, req, ws) {
    return 0;
}

function delete_server(data, req, ws) {
    return 0;
}

function get_server(data, req, ws) {
    return 0;
}

function get_servers(data, req, ws) {
    // Get user
    const user_id = req.session.user_id;

    // Get servers they are part of
    const servers = database.get_user_servers(user_id);

    return {"servers": servers};
}

/// USERS ///
function get_user(data, req, ws) {
    // If no ID is given, we try to use the request-ers id.
    if (!data.user_id)
         data.user_id = req.session.user_id

    if (!data.user_id)
        return false;

    // We have an ID to use
    const user = database.get_user_info(data.user_id);
    return {"user": user};
}

module.exports = {
    // Messages
    add_message,
    update_message,
    delete_message,
    get_messages,

    // Channels
    get_channel,
    get_channels,

    // Servers
    add_server,
    
    get_server,
    get_servers,

    // Users
    get_user
}