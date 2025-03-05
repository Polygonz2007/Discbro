const database = require("./database.js");
const path = require("path");

function profile(req, res) {
    // Returns profile page for certain user
    let page = "views/profile"
    //if (req.params.userid == req.session.userid)
     //   page = "views/profile-edit";

    let data = database.get_user_info(req.params.user_id);
    if (!data)
       return res.sendFile(path.join(global.public_path, "/util/user-not-found.html"));

    data["viewer_id"] = req.session.user_id;

    return res.render(page, data);
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