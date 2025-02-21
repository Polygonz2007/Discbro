
// Handles logging in, permissions and more

const database = require("./database.js");
const bcrypt = require("bcrypt");

function check_login(req, res, next) {
    if (req.session.userid)
        return next();
    else
        return res.redirect("/login");
}

function login(req, res) {
    const data = req.body;
    const id = database.check_username(data.username);
    if (!id)
        return res.send({"error": "User does not exist."});

    const user = database.get_user_info(id);
    if (!user)
        return res.send({"error": "Error fetching user data. Try again."});

    // Check password
    const compare = bcrypt.compareSync(data.password, user.password);
    if (!compare)
        return res.send({"error": "Username or password is incorrect."});
    
    // Correct, let them in
    req.session.userid = id;

    // Send to app
    return res.redirect("/app");
}

function create_account(req, res) {
    const data = req.body;

    console.log(data);

    // Check there is anything at all
    if (!data.username || !data.password)
        return res.send({"error": "Username / password cannot be empty!"});

    // Check character limits
    if (data.username.length > 32)
        return res.send({"error": "Username is too long."});

    // Check that user doesnt already exist
    if (database.check_username(data.username))
        return res.send({"error": "Username is in use."});

    // Check passwords match
    if (data.password != data.confirm)
        return res.send({"error": "Passwords do not match. Please make sure they are typed correctly."});

    // Create user
    const new_user = database.new_user(data.username, data.username, data.password);
    if (!new_user)
        return res.send({"error": new_user});

    // Get new id and log in
    const id = database.check_username(data.username);
    req.session.userid = id;

    // Send to app
    return res.redirect("/app");
}

module.exports = {
    check_login,
    login,
    create_account
}
