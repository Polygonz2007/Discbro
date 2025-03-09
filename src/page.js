const database = require("./database.js");
const path = require("path");

function profile(req, res) {
    // Returns profile page for certain user
    const id = database.check_username(req.params.username) || 0;
    let data = database.get_user_info(id);
    if (!data) // If user doesnt exist
       return res.sendFile(path.join(global.public_path, "/util/user-not-found.html"));

    data["viewer_id"] = req.session.user_id;

    return res.render("views/profile", data);
}

function app(req, res) {
    let user = database.get_user_info(req.session.user_id);
    user.push({"viewer_id": req.session.user_id});
    return res.render("index", user);
}

module.exports = {
    profile,
    app
}