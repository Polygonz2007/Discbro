
// This module is responsible for handling database interaction by the app, in a safe and proper way.

const sqlite3 = require('better-sqlite3');
const db = sqlite3('./src/discbro.db');
db.pragma('journal_mode = WAL');

const bcrypt = require("bcrypt");
const salt_rounds = 10;

const chunk_s = 32;

// Adds a user to the database, with checks if it is a valid name and stuff
function new_user(username, displayname, password) {
    // Check length
    if (username.length < 4 || username.length > 32)
        return "Username length not valid.";

    if (displayname.length > 32)
        return "Display name is too long.";

    // Check if another user already has username
    const user_check = check_username(username);

    if (!user_check)
        return "Username taken.";

    // Hash password
    const hash = bcrypt.hashSync(password, salt_rounds);

    // Insert new user
    const add_user = db.prepare("INSERT INTO users (username, displayname, password, profilepicture) VALUES (?, ?, ?, '/data/profile_pictures/default.png')");
    let user = add_user.run(username, displayname, hash);

    if (user.changes == 0)
        return "Database error. Please try again.";

    return true;
}

function new_group() {
    return 0;
}

function new_message(channelid, authorid, content) {
    if (content.length > 2048)
        return false;

    const query = db.prepare("INSERT INTO messages (channelid, authorid, content) VALUES (?, ?, ?)");
    let result = query.run(channelid, authorid, content);

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
function get_message_chunk(channelid, dir = false, lastid) {
    // If empty, get newest
    if (lastid == null) {
        const query = db.prepare(`SELECT * FROM messages WHERE channelid = ? ORDER BY id DESC LIMIT ?`);
        let result = query.all(channelid, chunk_s);
        if (result.length == 0) // If empty, return error
            return false;

        return result.reverse();
    }

    // We need to find the chunk we are looking for
    const query = db.prepare(`SELECT * FROM messages WHERE id ${dir ? ">" : "<"} ? AND channelid = ? ORDER BY id ${dir ? "ASC" : "DESC"} LIMIT ?`);
    let result = query.all(lastid, channelid, chunk_s);
    if (result.length == 0) // If empty, return error
        return false;

    // Flip order of chunk when reading old messages
    if (!dir)
        result.reverse();

    return result;
}

function get_message(messageid) {
    // Curently get all messages in a channel
    const query = db.prepare("SELECT * FROM messages WHERE id = ?");
    let result = query.all(messageid);

    if (result.length != 0)
        return result;

    return false;
}

function format_messages(messages) {
    if (!messages)
        return false;

    let buffer = {};

    messages.forEach((message) => {
        const authorid = message.authorid;

        if (buffer[authorid]) {
            // Use buffered data
            message.author = buffer[authorid];
        } else {
            // We need to find in the database
            const user = get_user_info(authorid);
            message.author = user.username;
            buffer[authorid] = user.username;
        }

        // Clean up data for transmission
        delete message.authorid;
        delete message.channelid;
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

module.exports = {
    new_user,
    check_username,
    get_user_info,
    delete_user,

    new_group,
    get_group_members,
    
    new_message,

    get_message,
    get_messages,
    get_message_chunk,
    format_messages
}
