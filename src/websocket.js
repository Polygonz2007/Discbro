
const database = require("./database.js");

///  FUNCTIONS  ///
// Message sent by client
function ws_send(data, req) {
    const user = database.get_user_info(req.session.userid);
    data.author = user.username;
    if (!data.author)
        data.author = "Anonymous User";

    // Find media links and insert media stuff
    //data.content = format.links(data.content);

    // Sanetize
    data.content = format.escape_html(data.content);

    // Handle incoming message
    const messageid = database.new_message(1, user.id, data.content);
    if (!messageid)
        return;

    console.log(messageid);

    const result = database.format_messages(database.get_message(messageid));

    console.log(result);

    wss.clients.forEach((client) => {
        client.send(JSON.stringify(result));
    });

    const end = Date.now();
    console.log(`Message, took ${end - start}ms to process.`);
}

// Get a chunk of messages
function ws_get(data, req, ws) {
    const messages = database.get_message_chunk(data.channelid, data.dir, data.lastid);
    if (!messages)
        return false;

    const formatted = database.format_messages(messages);
    ws.send(JSON.stringify(formatted));
}

module.exports = {
    ws_send,
    ws_get
}