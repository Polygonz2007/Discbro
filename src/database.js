
// This module is responsible for handling database interaction by the app, in a safe and proper way.

const sqlite3 = require('better-sqlite3');
const db = sqlite3('./src/discbro.db');
db.pragma('journal_mode = WAL');

console.log("Tables:");
console.log(db.prepare("SELECT * FROM sqlite_master").all());
console.log(db.prepare("SELECT * FROM users").all());

function new_user(username, displayname, password) {
    // Adds a user to the database, with checks if it is a valid name and stuff
    if (username.length < 4 || username.length > 32)
        return "Username length not valid.";

    if (displayname.length > 32)
        return "Display name is too long.";

    // Check if another user already has username
    const username_check = db.prepare("SELECT * FROM users WHERE user.username = ?");
    let user_check = username_check.all(username);

    if (user_check[0])
        return "Username taken.";

    // We are good to go
    const add_user = db.prepare('INSERT INTO users (username, displayname, password, profilepicture) VALUES (?, ?, ?, "/data/pfoile_pictures/default.png")');
    let user = add_user.run(username, displayname, password);

    console.log(user);
    console.log(user[0]);
}

function new_group() {
    return;
};

function new_message() {
    return;
};

function get_user_info() {
    return;
};

function get_group_members() {
    return;
};

function get_messages() {
    return;
};


module.exports = {
    new_user,
    new_group,
    new_message,
    get_user_info,
    get_group_members,
    get_messages
}