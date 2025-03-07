
// This module is responsible for handling database interaction by the app, in a safe and proper way.

const fs = require("fs");

const sqlite3 = require('better-sqlite3');
const db = sqlite3('./src/discbro.db');
db.pragma('journal_mode = WAL');

const bcrypt = require("bcrypt");
const salt_rounds = 10;

// Setup the database
function setup() {
    const setup_file = "./documentation/database.sql";
    const setup_string = fs.readFileSync(setup_file).toString();

    const queries = setup_string.split(";");

    for (let i = 0; i < queries.length - 1; i++) { // everything except last empty query
        db.prepare(queries[i]).run();
    }

    return 0;
}

// Adds a user to the database, with checks if it is a valid name and stuff
function new_user(username, display_name, password) {
    // Hash password
    const hash = bcrypt.hashSync(password, salt_rounds);

    // Insert new user
    const add_user = db.prepare("INSERT INTO users (username, display_name, password, profile_picture) VALUES (?, ?, ?, '/data/profile-sqpictures/default.png')");
    let user = add_user.run(username, display_name, hash);

    if (user.changes == 0)
        return "Database error. Please try again.";

    return true;
}

function new_group() {
    return 0;
}

function new_message(channel_id, author_id, content) {
    if (content.length > 2048)
        return false;

    const query = db.prepare("INSERT INTO messages (channel_id, author_id, content) VALUES (?, ?, ?)");
    let result = query.run(channel_id, author_id, content);

    if (result.changes == 0)
        return false;

    return result.lastInsertRowid;
}

function check_username(username) {
    // If a user is found returns the users id, if not returns -1
    const user_query = db.prepare("SELECT * FROM users WHERE username = ?");
    let user = user_query.all(username);

    if (user[0])
        return user[0].id;

    return false;
}

function get_user_info(id) {
    // Check if another user already has username
    const user_query = db.prepare("SELECT * FROM users WHERE id = ?");
    let user = user_query.all(id);

    if (user[0])
        return user[0];

    return false;
}

function get_group_members() {
    return true;
}

// Get all messages in a channel
function get_messages(channelid) {
    const query = db.prepare("SELECT * FROM messages WHERE channelid = ? ORDER BY id DESC");
    let result = query.all(channelid);

    if (result.length != 0)
        return result;

    return false;
}

// Gets a chunk of messages, of size chunk_s
// If dir is false, it reads messages BEFORE lastid
// Else, if dir is true, it reads messages AFTER lastid
// If no lastid is specified, it gets the newest chunk
function get_message_chunk(channel_id, dir = false, last_id, chunk_s) {
    // If empty, get newest
    if (last_id == null) {
        const query = db.prepare(`SELECT * FROM messages WHERE channel_id = ? ORDER BY id DESC LIMIT ?`);
        let result = query.all(channel_id, chunk_s);
        if (result.length == 0) // If empty, return error
            return false;

        return result.reverse();
    }

    // We need to find the chunk we are looking for
    const query = db.prepare(`SELECT * FROM messages WHERE id ${dir ? ">" : "<"} ? AND channel_id = ? ORDER BY id ${dir ? "ASC" : "DESC"} LIMIT ?`);
    let result = query.all(last_id, channel_id, chunk_s);
    if (result.length == 0) // If empty, return error
        return false;

    // Flip order of chunk when reading old messages
    if (!dir)
        result.reverse();

    return result;
}

function get_message(message_id) {
    // Curently get all messages in a channel
    const query = db.prepare("SELECT * FROM messages WHERE id = ?");
    let result = query.all(message_id);

    if (result.length != 0)
        return result;

    return false;
}

function format_messages(messages, user_id) {
    if (!messages)
        return false;

    let buffer = {};
    const user = get_user_info(user_id);

    messages.forEach((message) => {
        const author_id = message.author_id;

        if (buffer[author_id]) {
            // Use buffered data
            message.author = buffer[author_id];
        } else {
            // We need to find in the database
            const user = get_user_info(author_id);
            const author = { "username": user.username, "display_name": user.display_name, "id": author_id };
            
            message.author = author;
            buffer[author_id] = author;
        }

        const search_str = " " + message.content + " ";
        if ((user && search_str.indexOf(` @${user.username} `) != -1) || search_str.indexOf(` @everyone `) != -1)
            message.highlight = true;

        // Clean up data for transmission
        delete message.author_id; // already in author
        delete message.channel_id; // already in chunk
    });

    return messages;
}

function delete_user(username) {
    // Get user
    const username_check = db.prepare("SELECT id FROM users WHERE username = ?");
    let user_check = username_check.all(username);

    if (user_check.length == 0)
        return "Could not find user " + username + " in the database.";

    // REMOVE THEM
    const remove_user = db.prepare("DELETE FROM users WHERE id = ?");
    let result = remove_user.run(user_check[0].id);

    if (result.changes == 0)
        return "Database error. Please try again."

    return true;
}

function get_channels(server_id, user_id) {
    // For now just returns all channels
    // But eventually, returns all channels in a server the user has access to
    const query = db.prepare("SELECT id, name FROM channels");
    const channels = query.all();
    if (channels.length == 0)
        return false;

    return channels;
}

function get_channel(id) {
    const query = db.prepare("SELECT id, name, created_time FROM channels WHERE id = ?");
    const channel = query.get(id);
    if (channel.length == 0)
        return false;

    return channel;
}

module.exports = {
    setup,

    new_user,
    check_username,
    get_user_info,
    delete_user,

    get_channel,
    get_channels,
    
    new_message,

    get_message,
    get_messages,
    get_message_chunk,
    format_messages
}
