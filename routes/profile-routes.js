// for all endpoints beginning with /api/profile
require('dotenv').config();
const express = require("express");
const usersDB = require("../models/dbHelpers");
var validUrl = require('valid-url');

const router = express.Router();
var urlencodedParser = express.urlencoded({extended: true});   // allows the ability to parse input from an html form

router.get('/', (req, res) => {
    const {email} = req.session.user;

    usersDB.findUserByEmail(email)
        .then(user => {
            res.render("profile.njk", {giftList: eval(user.giftList), user: req.session.user});
        })
        .catch(err => {
            res.render("response.njk", {user: req.session.user, title: "Could Not Load Profile", link: "/", message: "error: " + err, buttonMsg: "BACK TO HOME PAGE"});
        })
});

router.post('/added_gift_status', urlencodedParser, (req, res) => {
    const {email} = req.session.user;
    const {itemName, notes, price, quantity, size, storeLink} = req.body;
    const newGift = {
        itemName: itemName,
        notes: notes,
        price: price,
        quantity: quantity,
        size: size,
        storeLink: storeLink
    }

    usersDB.addGift(email, newGift)
        .then(user => {
            res.render("response.njk", {user: req.session.user, title: "Added Gift", link: "/api/profile", message: "Gift Added Successfully!", buttonMsg: "BACK TO GIFT LIST"});
        })
        .catch(err => {
            res.render("response.njk", {user: req.session.user, title: "Could Not Add Gift", link: "/api/profile", message: "error: " + err, buttonMsg: "BACK TO GIFT LIST"});
        }) 
});

router.post('/deleted_gift_status', urlencodedParser, (req, res) => {
    const {email} = req.session.user;
    const index = req.body.index;

    usersDB.deleteGift(email, index)
        .then(user => {
            res.render("response.njk", {user: req.session.user, title: "Gift Deleted", link: "/api/profile", message: "Gift Successfully Deleted!", buttonMsg: "BACK TO GIFT LIST"});
        })
        .catch(err => {
            res.render("response.njk", {user: req.session.user, title: "Error", link: "/api/profile", message: "error: " + err, buttonMsg: "BACK TO GIFT LIST"});
        })
})

router.post('/save_changes_status', urlencodedParser, (req, res) => {
    const {email} = req.session.user;
    const index = req.body.index;
    let {itemName, notes, price, quantity, size, storeLink} = req.body;
    if (storeLink == "") {
        console.log("empty url");
        storeLink = ""
    } else if (!validUrl.isUri(storeLink)){
        storeLink = "Invalid Url was submitted";
    }

    const giftChanges = {
        itemName: itemName,
        notes: notes,
        price: price,
        quantity: quantity,
        size: size,
        storeLink: storeLink
    }

    usersDB.saveGiftChanges(email, index, giftChanges)
        .then(user => {
            res.render("response.njk", {user: req.session.user, title: "Gift Changes Saved", link: "/api/profile", message: "Changes Successfully Saved", buttonMsg: "BACK TO GIFT LIST"});
        })
        .catch(err => {
            res.render("response.njk", {user: req.session.user, title: "Error", link: "/api/profile", message: "error: " + err, buttonMsg: "BACK TO GIFT LIST"});
        })
})

module.exports = router;