// for all endpoints beginning with /api/authenticate
require('dotenv').config();
const express = require("express");
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');
const sendMail = require('./sendMail');
const db = require("../db");

const router = express.Router();
router.use(express.json());
var urlencodedParser = express.urlencoded({extended: true});

router.post("/sign_up_status", urlencodedParser, async (req, res) => {
    const credentials = req.body
    const {email, firstname, lastname, username, password} = credentials;

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
        res.render("response.njk", {user: req.session.user, title: "Sign Up Error", link: "/sign-up", message: errorMessage, buttonText: "Back to sign up page"});
        return;
    }

    // check for valid password
    let badPassword = false;

    if (password.length < 8) { errorMessage = "password needs at least 8 characters!"; badPassword = true; }
    if (password.length > 128) { errorMessage = "passwords can't exceed 128 characters!"; badPassword = true; }
    if (hasBadChars.test(password)) { errorMessage = `password can't contain \` {} \\ [\] : " ; ' , . "`; badPassword = true; }
    else if (!hasSpaces.test(password)) { errorMessage = "password can't contain spaces"; badPassword = true;}
    else if (!hasDigit.test(password)) { errorMessage = "password must contain a digit!"; badPassword = true; }
    else if (!hasLowercase.test(password)) { errorMessage = "password must contain a lowercase letter"; badPassword = true; }
    else if (!hasUppercase.test(password)) { errorMessage = "password must contain a uppercase letter"; badPassword = true; }

    if (badPassword) {
        res.render("response.njk", {user: req.session.user, title: "Sign Up Error", link: "/sign-up", message: errorMessage, buttonText: "Back to sign up page"});
        return;
    }

    // generate a random set of numbers for email confirmation 
    let emailCode = "";
    for(i = 0; i < 5; i++) {emailCode +=  String(Math.floor(Math.random() * 101));}

    // this function generates a salted hashed password
    bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS), async function(err, salt) {
        bcrypt.hash(password, salt, async function(err, hash) {
            try {
                // adding a new user to the database
                const newUser = await db.query(
                    `
                    INSERT INTO users (uuid, role, email, username, firstname, lastname, password, code, followers, followerTotal, following, followingTotal) 
                    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
                    RETURNING *
                    `, [uuidv4(), "temp_user", email, username, firstname, lastname, hash, emailCode, [], 0, [], 0]
                );

                const url = new URL(req.protocol + '://' + req.get('host') + "/api/authenticate/activate/" + email + "&" + emailCode);
                sendMail(url, email);
                
                req.session.user = {role: "temp_user", firstname: firstname, lastname: lastname, email: email, username: username};
                res.render("response.njk", {user: req.session.user, title: "Sign Up Success!", link: "/", message: "Thanks for signing up! Be sure to enter the confirmation code you received in your email to finish making your profile", buttonText: "Back to homepage"});
            } catch (err) {
                console.log(err);
                res.render("response.njk", {user: req.session.user, title: "Sign Up Error", link: "/sign-up", message: "That username or email has already been taken!" , buttonText: "Back to sign up page"});
            }
        });
    });
});

router.post('/login_status', urlencodedParser, async (req, res) => {
    try {
        const {email, password} = req.body;
        const dbResult = await db.query(
            `
            SELECT * 
            FROM users
            WHERE email = $1
            `,[email]
        );
        const user = dbResult.rows[0];

        // check if user was found then check their password
        if (user) {
            bcrypt.compare(password, user.password, async function(err, passwordMatch) {
                    if (passwordMatch) {    
                        req.session.user = {role: user.role, firstname: user.firstname, lastname: user.lastname, email: user.email, username: user.username};
                        res.render("response.njk", {user: req.session.user, title: "Login Successful", link: "/api/profile", message: "Successfully Logged In", buttonText: "Go to gift list"});
                    } else {
                        res.render("response.njk", {user: req.session.user, title: "Login Error", link: "/login", message: "Incorrect email or password", buttonText: "Back to login page"});
                    }
            });
        } else {
            req.session.user = {role: "guest", firstname: "", lastname: "", email: "", username: ""};
            res.render("response.njk", {user: req.session.user, title: "Login Error", link: "/login", message: "Incorrect email or password", buttonText: "Back to login page"});
        }
    } catch (error) {
        req.session.user = {role: "guest", firstname: "", lastname: "", email: "", username: ""};
        res.render("response.njk", {user: req.session.user, title: "Login Error", link: "/login", message: "Error: " + err, buttonText: "Back to sign up page"});
    }
});

router.post('/logout_status', urlencodedParser, async (req, res) => {
	req.session.user = {role: "guest", firstname: "", lastname: "", email: "", username: ""};
	res.render("response.njk", {user: req.session.user, title: "Logged Out", link: "/", message: "Successfully Logged Out", buttonText: "Back to homepage"});
});

router.get("/activate/:parameter1&:parameter2", urlencodedParser, async (req, res) => {
    try {
        const email = req.params.parameter1;
        const emailCode = req.params.parameter2;

        // if email code was correct then upgrade them to a "user"
        let dbResult = await db.query(
            `
            UPDATE users
            SET role = $1
            WHERE (email = $2 AND code = $3)
            RETURNING *
            `, ["user", email, emailCode]
        );

        if (dbResult.rows.length == 1) {
            const {firstname, lastname, username} = dbResult.rows[0];
            req.session.user = {role: "user", firstname: firstname, lastname: lastname, email: email, username: username};
            res.render("response.njk", {user: req.session.user, title: "Email Confirmed", link: "/api/profile", message: "Your profile is now complete", buttonText: "Go to gift list"});
        } else {
            res.render("response.njk", {user: req.session.user, title: "Error", link: "/", message: "Sorry, the email confirmation code you entered is not valid!", buttonText: "Back to homepage"});
        }
    } catch (error) {
        res.render("response.njk", {user: req.session.user, title: "Error", link: "/", message: "error: " + error, buttonText: "Back to homepage"});
    }
});

router.post('/resend_confirmation_code', urlencodedParser, async (req, res) => {
    try {
        const {email} = req.session.user;
        const dbResult = await db.query(
            `
            SELECT email, code
            FROM users
            WHERE email = $1
            `, [email]
        )
    
        if (dbResult.rows.length == 1) {
            //sendMail(email, dbResult.rows[0].code);
            const url = new URL(req.protocol + '://' + req.get('host') + "/api/authenticate/activate/" + email + "&" + dbResult.rows[0].code);
            sendMail(url, email);
            res.render("response.njk", {user: req.session.user, title: "Code Re-Sent", link: "/", message: "Email confirmation code has been resent to your email address!", buttonText: "Back to homepage"});
        } else {
            res.render("response.njk", {user: req.session.user, title: "Error", link: "/", message: "error: " + err, buttonText: "Back to homepage"});
        }
    } catch (error) {
        res.render("response.njk", {user: req.session.user, title: "Error", link: "/", message: "error: " + err, buttonText: "Back to homepage"});
    }
});

module.exports = router;