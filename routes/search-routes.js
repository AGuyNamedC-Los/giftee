const express = require("express");
const usersDB = require("../models/dbHelpers");

const router = express.Router();
var urlencodedParser = express.urlencoded({extended: true});

router.get('/', (req, res) => {
    usersDB.findVerifiedUsernames()
        .then(usernames => {
            // extracts the contents of the usernames object and put them into an array of strings
            let usernameArray = [];
            for(let i = 0; i < usernames.length; i++) {
                usernameArray.push(usernames[i].username);
            }

            res.render('search.njk', {user: req.session.user, usernames: usernameArray});
        })
        .catch(err => {
            res.render("response.njk", {user: req.session.user, title: "Error", link: "/", message: "error: " + err, buttonMsg: "BACK TO HOME"});
        })
})

router.get('/:username', urlencodedParser, (req, res) => {
    const {username} = req.params;

    usersDB.findUserByUsername(username)
        .then(user => {
            res.render('searchResult.njk', {user: req.session.user, username: user.username, giftList: eval(user.giftList)});
        })
        .catch(err => {
            res.render("response.njk", {user: req.session.user, title: "User Not Found", link: "/api/search", message: "Could Not Find A User With That Name", buttonMsg: "BACK TO SEARCH"});
        })
})

module.exports = router;