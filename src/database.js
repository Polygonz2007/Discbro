
// This module is responsible for handling database interaction by the app, in a safe and proper way.

const fs = require("fs");
const format = require("./format.js");

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
function new_user(username, display_name, password, email) {
    // Hash password
    const hash = bcrypt.hashSync(password, salt_rounds);

    // Insert new user
    const add_user = db.prepare("INSERT INTO users (username, display_name, password, image, email) VALUES (?, ?, ?, '/data/user-image/1.png', ?)");
    let user = add_user.run(username, display_name, hash, email);

    if (user.changes == 0)
        return "Database error. Please try again.";

    // Send account created notif to email, so they can verify the email
    // ---
    
    return true;
}

function new_group() {
    return 0;
}

function add_message(channel_id, author_id, content) {
    if (content.length > 2048)
        return false;

    const query = db.prepare("INSERT INTO messages (channel_id, author_id, content) VALUES (?, ?, ?)");
    let result = query.run(channel_id, author_id, content);

    if (result.changes == 0)
        return false;

    return result.lastInsertRowid;
}

function update_message() {
    return 0;
}

function delete_message(message_id) {
    const query = db.prepare("DELETE FROM messages WHERE id = ?");
    let result = query.run(message_id);

    if (result.changes == 0)
        return false;

    console.log("it twas deleted")

    return true;
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
    if (id == 0)
        return false;

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

// Gets a chunk of messages, of size chunk_s
// If dir is false, it reads messages BEFORE lastid
// Else, if dir is true, it reads messages AFTER lastid
// If no lastid is specified, it gets the newest chunk
function get_messages(channel_id, amount, anchor, direction) {
    // If empty, get newest
    if (anchor == null) {
        console.log("no ancgir")
        const query = db.prepare(`SELECT * FROM messages WHERE channel_id = ? ORDER BY id DESC LIMIT ?`);
        let result = query.all(channel_id, amount);
        console.log(result)
        if (result.length == 0) // If empty, return error
            return false;

        return result.reverse();
    }

    // We need to find the chunk we are looking for
    const query = db.prepare(`SELECT * FROM messages WHERE id ${direction ? ">" : "<"} ? AND channel_id = ? ORDER BY id ${direction ? "ASC" : "DESC"} LIMIT ?`);
    let result = query.all(anchor, channel_id, amount);
    if (result.length == 0) // If empty, return error
        return false;

    // Flip order of chunk when reading old messages
    if (!direction)
        result.reverse();

    return result;
}

function get_message(message_id) {
    // Curently get all messages in a channel
    const query = db.prepare("SELECT * FROM messages WHERE id = ?");
    let result = query.all(message_id);

    if (result.length != 0)
        return result[0];

    return false;
}

function format_messages(messages, user_id) { // just do this on the client bro wtf
    if (!messages)
        return false;

    let buffer = {};
    const user = get_user_info(user_id);

    console.log(messages)
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

        // Add embeds and such
        message.content = format.embeds(message.content);

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
    const query = db.prepare("SELECT id, name, created_time FROM channels WHERE server_id = ?");
    const channels = query.all(server_id);
    if (channels.length == 0)
        return false;

    // Clean up data

    return channels;
}

function get_channel(id) {
    const query = db.prepare("SELECT id, name, category_id, created_time FROM channels WHERE id = ?");
    const channel = query.get(id);
    if (channel.length == 0)
        return false;

    return channel;
}

function get_channel_stats(id) {
    const query = db.prepare("SELECT id, name, created_time, num_messages FROM channels INNER JOIN (SELECT channel_id, COUNT(*) as num_messages FROM messages) ON id = channel_id WHERE id = ?");
    const stats = query.get(id);
    if (stats.length == 0)
        return false;

    return stats;
}


/// SERVERS ///
function add_server(user_id, name, picture) {
    // Valiodate someting¨

    // Upload picture

    // Make the server
    const query = db.prepare(`
        INSERT INTO servers (name, image, creator_id)
        VALUES (?, ?, ?)`);
    const result = query.run(name, "/data/server-image/default.png", user_id);

    if (result.changes == 0)
        return false;

    const server_id = result.lastInsertRowid;

    // Add creator to it
    const member_id = add_member(user_id, server_id);
    if (!member_id)
        return false;

    // Make default and admin role
    const default_role_id = add_role(server_id, "default", "#888888", false);
    const admin_role_id = add_role(server_id, "admin", "#ffffff", true);
    if (!default_role_id || !admin_role_id)
        return false;

    // Give creator admin role
    const role_add_check = add_member_role(member_id, admin_role_id);
    if (!role_add_check)
        return false;

    return true;
}

function get_user_servers(user_id) {
    const query = db.prepare(`
        SELECT server_id AS id, name, image
        FROM servers, members
        WHERE members.user_id = ? AND servers.id = members.server_id`);
    const servers = query.all(user_id);

    return servers;
}


/// MEMBERS ///
function add_member(user_id, server_id) { // add auth code
    const query = db.prepare(`
        INSERT INTO members (user_id, server_id)
        VALUES (?, ?)`);
    const result = query.run(user_id, server_id);
    if (result.changes == 0)
        return false;

    return result.lastInsertRowid;
}


/// ROLES ///
function add_role(server_id, name, color, perms) {
    // For now, perms is a bool, 0 = default, 1 = admin
    const query = db.prepare(`
        INSERT INTO roles (name, color, server_id, admin)
        VALUES (?, ?, ?, ?)`);
    const result = query.run(name, color, server_id, perms);
    if (result.changes == 0)
        return false;

    return result.lastInsertRowid;
}

function add_member_role(member_id, role_id) {
    // For now, perms is a bool, 0 = default, 1 = admin
    const query = db.prepare(`
        INSERT INTO member_roles (member_id, role_id)
        VALUES (?, ?)`);
    const result = query.run(member_id, role_id);
    if (result.changes == 0)
        return false;

    return result.lastInsertRowid;
}

function get_user_perms(user_id, server_id) {
    // Get all roles they have in server, and return highest of each
    const query = db.prepare(`
        SELECT admin FROM `); // finish this
    const result = query.run(member_id, role_id);
    if (result.changes == 0)
        return false;

    return result;
}


module.exports = {
    setup,

    new_user,
    check_username,
    get_user_info,
    delete_user,

    get_channel,
    get_channels,
    get_channel_stats,
    
    add_message,
    update_message,
    delete_message,

    get_message,
    get_messages,
    format_messages,

    // Server
    add_server,
    get_user_servers
}
