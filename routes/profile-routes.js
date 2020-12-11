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
        res.render("response.njk", {user: req.session.user, title: "Could Not Load Profile", link: "/", message: "error: " + err, buttonMsg: "BACK TO HOME PAGE"});
    }
});

router.post('/added_gift_status', urlencodedParser, async (req, res) => {
    try {
        const {email} = req.session.user;
        let newGift = req.body;

        if (newGift["storeLink"] == "") { newGift["storeLink"] = ""; } 
        else if (!validUrl.isUri(newGift["storeLink"])) { newGift["storeLink"] = "Invalid Url was submitted"; }

        const dbResult = await db.query(
            `
            UPDATE users 
            SET giftlist = COALESCE(giftlist, '[]'::jsonb) || $1::jsonb
            WHERE email = $2;
            `, [newGift, email]
        );

        res.render("response.njk", {user: req.session.user, title: "Added Gift", link: "/api/profile", message: "Gift Added Successfully!", buttonMsg: "BACK TO GIFT LIST"});
    } catch (err) {
        res.render("response.njk", {user: req.session.user, title: "Could Not Add Gift", link: "/api/profile", message: "error: " + err, buttonMsg: "BACK TO GIFT LIST"});
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
            WHERE email $2
            `, [index, email]
        );
        
        res.render("response.njk", {user: req.session.user, title: "Gift Deleted", link: "/api/profile", message: "Gift Successfully Deleted!", buttonMsg: "BACK TO GIFT LIST"});
    } catch (err) {
        res.render("response.njk", {user: req.session.user, title: "Error", link: "/api/profile", message: "error: " + err, buttonMsg: "BACK TO GIFT LIST"});
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

        res.render("response.njk", {user: req.session.user, title: "Gift Changes Saved", link: "/api/profile", message: "Changes Successfully Saved", buttonMsg: "BACK TO GIFT LIST"});
    } catch (err) {
        res.render("response.njk", {user: req.session.user, title: "Error", link: "/api/profile", message: err, buttonMsg: "BACK TO GIFT LIST"});
    }
});

module.exports = router;