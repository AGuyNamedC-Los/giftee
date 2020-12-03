// for all endpoints beginning with /api/authenticate
require('dotenv').config();
const express = require("express");
const usersDB = require("../models/dbHelpers");
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const sendMail = require('./sendMail');

const router = express.Router();
var urlencodedParser = express.urlencoded({extended: true});

router.post('/sign_up_status', urlencodedParser, (req, res) => {
    let credentials = req.body;
    let {username, password} = credentials;

    // regex to test for string inputs
	let hasBadChars = /^(?=.*[`{}\\[\]:";',./-])/;
	let hasSpaces = /^[\S]+$/;
	let hasDigit = /^(?=.*\d)/;
	let hasLowercase = /^(?=.*[a-z])/;
    let hasUppercase = /^(?=.*[A-Z])/;
    
    // check for valid username
	let badUsername = false;

	if (username.length < 3) { errorMessage = "Username needs at least 3 characters!"; badUsername = true; }
	if (username.length > 40) { errorMessage = "Username can't exceed 30 characters!"; badUsername = true; }
	if (hasBadChars.test(username)) { errorMessage = `Username can't contain \` {} \\ [\] : " ; ' , . "`; badUsername = true; }
	else if (!hasSpaces.test(username)) { errorMessage = "Username can't contain spaces"; badUsername = true;}

	if (badUsername) {
		res.render("response.njk", {user: req.session.user, title: "Sign Up Error", link: "/sign-up", message: errorMessage, buttonMsg: "BACK TO SIGN UP PAGE"});
		return;
	}

	// check for valid password
	badPassword = false;

	if (password.length < 8) { errorMessage = "password needs at least 8 characters!"; badPassword = true; }
	if (password.length > 128) { errorMessage = "passwords can't exceed 128 characters!"; badPassword = true; }
	if (hasBadChars.test(password)) { errorMessage = `password can't contain \` {} \\ [\] : " ; ' , . "`; badPassword = true; }
	else if (!hasSpaces.test(password)) { errorMessage = "password can't contain spaces"; badPassword = true;}
	else if (!hasDigit.test(password)) { errorMessage = "password must contain a digit!"; badPassword = true; }
	else if (!hasLowercase.test(password)) { errorMessage = "password must contain a lowercase letter"; badPassword = true; }
	else if (!hasUppercase.test(password)) { errorMessage = "password must contain a uppercase letter"; badPassword = true; }

	if (badPassword) {
		res.render("response.njk", {user: req.session.user, title: "Sign Up Error", link: "/sign-up", message: errorMessage, buttonMsg: "BACK TO SIGN UP PAGE"});
		return;
    }

    // generate a random set of numbers for email confirmation 
    let emailCode = "";
	for(i = 0; i < 5; i++) {
        emailCode +=  String(Math.floor(Math.random() * 101));
    }
    credentials.code = emailCode;   // adding a code value to credentials
    credentials.profilePicture = "" // adding a profile picture value to credentials

    bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS), function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            credentials.salt = salt;    // adding a salt value to credentials
            credentials.hashedPassword = hash   // adding a hashed password to credentials

            usersDB.addUser(credentials, uuidv4())
            .then(user => {
                sendMail(credentials.email, credentials.code);
                req.session.user = {role: "temp_user", firstname: credentials.firstname, lastname: credentials.lastname, email: credentials.email, username: credentials.username};
                res.render("response.njk", {user: req.session.user, title: "Sign Up Success!", link: "/", message: "Thanks for signing up! Be sure to enter the confirmation code you received in your email to finish making your profile", buttonMsg: "BACK TO HOME PAGE"});
            })
            .catch(err => {
                if (err.errno == 19) {
                    res.render("response.njk", {user: req.session.user, title: "Sign Up Error", link: "/sign-up", message: "That username or email has already been taken!", buttonMsg: "BACK TO SIGN UP PAGE"});
                }
                else {
                    res.render("response.njk", {user: req.session.user, title: "Sign Up Error", link: "/sign-up", message: "Error: " + err, buttonMsg: "BACK TO SIGN UP PAGE"});
                }
            })
        });
    });

});

router.post('/login_status', urlencodedParser, (req, res) => {
    let {email, password} = req.body;

    usersDB.findUserByEmail(email)
        .then((user) => {
            if (user) {     // found user with matching email
                bcrypt.compare(password, user.password, function(err, passwordMatch) {
                    if (passwordMatch) {    
                        req.session.user = {role: user.role, firstname: user.firstname, lastname: user.lastname, email: user.email, username: user.username};
                        res.render("response.njk", {user: req.session.user, title: "Login Successful", link: "/api/profile", message: "Successfully Logged In", buttonMsg: "GO TO GIFT LIST"});
                    } else {
                        res.render("response.njk", {user: req.session.user, title: "Login Error", link: "/login", message: "Incorrect email or password", buttonMsg: "BACK TO LOGIN"});
                    }
                });
            } else {
                res.render("response.njk", {user: req.session.user, title: "Login Error", link: "/login", message: "Incorrect email or password", buttonMsg: "BACK TO LOGIN"});
            }
        })
})

router.post('/logout_status', urlencodedParser, async function(req, res) {
	req.session.user = {role: "guest", firstname: "", lastname: "", email: "", username: ""};
	res.render("response.njk", {user: req.session.user, title: "Logged Out", link: "/", message: "Successfully Logged Out", buttonMsg: "BACK TO HOME"});
});

router.post('/email_confirmation_status', urlencodedParser, (req, res) => {
    const {email} = req.session.user;
    const emailCode = req.body.emailConfirmationCode;

    usersDB.findUserByEmail(email)
        .then(user => {
            if (user.code == emailCode) {   // correct email confirmation code
                usersDB.upgradeUser(email)
                    .then(() => {
                        req.session.user = {role: "user", firstname: user.firstname, lastname: user.lastname, email: user.email, username: user.username};
                        res.render("response.njk", {user: req.session.user, title: "Email Confirmed", link: "/api/profile", message: "Your profile is now complete", buttonMsg: "GO TO GIFTLIST"});
                    })
                    .catch(err => {
                        res.render("response.njk", {user: req.session.user, title: "Error", link: "/", message: "error: " + err, buttonMsg: "BACK TO HOME PAGE"});
                    })
            } else {    // incorrect email confirmation code
                res.render("response.njk", {user: req.session.user, title: "Wrong Code", link: "/", message: "Wrong Email Confirmation Code", buttonMsg: "BACK TO HOMEPAGE"});
            }
        })
        .catch(err => {
            res.render("response.njk", {user: req.session.user, title: "Error", link: "/", message: "error: " + err, buttonMsg: "BACK TO HOME PAGE"});
        })
});

router.post('/resend_confirmation_code', urlencodedParser, (req, res) => {
    const {email} = req.session.user;

    usersDB.findUserByEmail(email)
        .then(user => {
            sendMail(user.email, user.code);
            res.render("response.njk", {user: req.session.user, title: "Code Re-Sent", link: "/", message: "Email confirmation code has been resent to your email address!", buttonMsg: "BACK TO HOMEPAGE"});
        })
        .catch(err => {
            res.render("response.njk", {user: req.session.user, title: "Error", link: "/", message: "error: " + err, buttonMsg: "BACK TO HOME PAGE"});
        })
})

module.exports = router;