// for all endpoints beginning with /api/search
const express = require("express");
const db = require("../db");

const router = express.Router();
var urlencodedParser = express.urlencoded({extended: true});

router.get('/', async (req, res) => {
    try {
        const dbResult = await db.query(
            `
            SELECT username
            FROM users
            WHERE role = $1
            `, ["user"]
        );

        let usernames = [];
        for (i = 0; i < dbResult.rows.length; i++) { 
            usernames.push(dbResult.rows[i]["username"]); 
        }
        
        res.render('search.njk', {user: req.session.user, usernames: usernames});
    } catch (err) {
        res.render("response.njk", {user: req.session.user, title: "Error", link: "/", message: err, buttonMsg: "BACK TO HOME"});
    }
    
});

router.get('/:username', urlencodedParser, async (req, res) => {
    try {
        const {username} = req.params;
        const dbResult = await db.query(
            `
            SELECT giftlist
            FROM users
            WHERE username = $1
            `, [username]
        );

        if (dbResult.rows.length == 0) {
            res.render("response.njk", {user: req.session.user, title: "User Not Found", link: "/api/search", message: "Could Not Find A User With That Name", buttonMsg: "BACK TO SEARCH"});
        } else {
            res.render('searchResult.njk', {user: req.session.user, username: username, giftList: dbResult.rows[0]["giftlist"]});
        }
    } catch (err) {
        res.render("response.njk", {user: req.session.user, title: "Error", link: "/", message: err, buttonMsg: "BACK TO HOME"});
    }
});

module.exports = router;