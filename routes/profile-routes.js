// for all endpoints beginning with /api/profile
// https://levelup.gitconnected.com/working-with-a-jsonb-array-of-objects-in-postgresql-d2b7e7f4db87
require('dotenv').config();
const express = require("express");
const db = require("../db");
var validUrl = require('valid-url');

const router = express.Router();
var urlencodedParser = express.urlencoded({extended: true});   // allows the ability to parse input from an html form

router.get('/', async (req, res) => {
    try {
        const {email} = req.session.user;
        const dbResult = await db.query(
            `
            SELECT giftlist
            FROM users
            WHERE email = $1
            `, [email]
        );

        let giftlist = dbResult.rows[0]["giftlist"];
        res.render("profile.njk", {giftList: giftlist, user: req.session.user});
    } catch (err) {
        res.render("response.njk", {user: req.session.user, title: "Could Not Load Profile", link: "/", message: err, buttonText: "Back to homepage"});
    }
});

const GIFT_LIST_SIZE_LIMIT = 200;
router.post('/added_gift_status', urlencodedParser, async (req, res) => {
    try {
        const {email} = req.session.user;
        let newGift = req.body;

        // check to make sure user has not exceeded gift list size
        let dbResult = await db.query(
            `
            SELECT giftlist
            FROM users
            WHERE email = $1
            `, [email]
        );
        
        let giftlist = dbResult.rows[0]["giftlist"];
        
        if (giftlist == null) {
            // so that length is not checked on a null object
            // happens for new users who have nothing in their gift list
        }
        else if (giftlist.length > GIFT_LIST_SIZE_LIMIT) {
            console.log("gift list is too big!");
            res.render("response.njk", {user: req.session.user, title: "Could Not Add Gift", link: "/api/profile", message: "You have exceeded the amount of gift you can add to your gift list! Try deleting a couple gifts if you would like to add more.", buttonText: "Back to gift list"});
            return;
        }

        // ensure a proper link was entered
        if (newGift["storeLink"] == "") { newGift["storeLink"] = ""; } 
        else if (!validUrl.isUri(newGift["storeLink"])) { newGift["storeLink"] = "Invalid Url was submitted"; }

        // add a gift to the user's gift list
        dbResult = await db.query(
            `
            UPDATE users 
            SET giftlist = COALESCE(giftlist, '[]'::jsonb) || $1::jsonb
            WHERE email = $2
            `, [newGift, email]
        );

        res.render("response.njk", {user: req.session.user, title: "Added Gift", link: "/api/profile", message: "The gift you added was successfully added to your gift list!", buttonText: "Back to gift list"});
    } catch (err) {
        console.log(err);
        res.render("response.njk", {user: req.session.user, title: "Could Not Add Gift", link: "/api/profile", message: err, buttonText: "Back to gift list"});
    }
});

router.post('/deleted_gift_status', urlencodedParser, async (req, res) => {
    const {email} = req.session.user;
    const {index} = req.body;

    try {
        const dbResult = await db.query(
            `
            UPDATE users
            SET giftlist = giftlist - $1::integer
            WHERE email = $2
            `, [index, email]
        );
        
        res.render("response.njk", {user: req.session.user, title: "Gift Deleted", link: "/api/profile", message: "The gift you chose has been successfully deleted from your gift list!", buttonText: "Back to gift list"});
    } catch (err) {
        res.render("response.njk", {user: req.session.user, title: "Error", link: "/api/profile", message: err, buttonText: "Back to gift list"});
    }
});

router.post('/save_changes_status', urlencodedParser, async (req, res) => {
    try {
        const {email} = req.session.user;
        let {index, ...newGift} = req.body;

        if (newGift["storeLink"] == "") { newGift["storeLink"] = ""; } 
        else if (!validUrl.isUri(newGift["storeLink"])) { newGift["storeLink"] = "Invalid Url was submitted"; }

        let dbResult = await db.query(
            `
            SELECT giftlist
            FROM users
            WHERE email = $1
            `, [email]
        );

        let giftlist = dbResult.rows[0]["giftlist"];
        giftlist[parseInt(index)] = newGift;    // overwrite the changes to the gift

        dbResult = await db.query(
            `
            UPDATE users
            SET giftlist = $1::jsonb
            WHERE email = $2
            `, [JSON.stringify(giftlist), email]
        );

        res.render("response.njk", {user: req.session.user, title: "Gift Changes Saved", link: "/api/profile", message: "Changes to the gift in your gift list has been successfully saved.", buttonText: "Back to gift list"});
    } catch (err) {
        res.render("response.njk", {user: req.session.user, title: "Error", link: "/api/profile", message: err, buttonText: "Back to gift list"});
    }
});

module.exports = router;