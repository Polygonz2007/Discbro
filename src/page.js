const database = require("./database.js");

function profile(req, res) {
    // Returns profile page for certain user
    let page = "views/profile"
    if (req.params.userid == req.session.userid)
        page = "views/profile-edit";

    return res.render(page, database.get_user_info(req.params.userid));
}

function app(req, res) {
    const user = database.get_user_info(req.session.userid);
    console.log(user)
    return res.render("index", user);
}

module.exports = {
    profile,
    app
}