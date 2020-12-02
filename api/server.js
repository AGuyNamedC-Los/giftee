require('dotenv').config();
const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const path = require('path');
const setupMiddleware = require('../authentication/setupMiddleware');
const usersOnly = require('../authentication/usersOnlyMiddleware');
const authenticateRouter = require('../authentication/authentication-routes');
const profileRouter = require('../routes/profile-routes');
const searchRouter = require('../routes/search-routes');
const usersOnlyMiddleware = require('../authentication/usersOnlyMiddleware');

var server = express();
const sessionConfig = {
    name: "YUMMY",
    secret: process.env.SECRET,
    cookie: {
        secure: false,
        httpOnly: true,
    },
    resave: false,
    saveUninitialized: true
};

server.use(session(sessionConfig));  // so the session has a cookie
server.use(setupMiddleware);    // so the session has middleware
server.use(express.json());
server.use(express.static('public'));  // allows the use of the public directory which includes the css

nunjucks.configure('templates', {
    autoescape: true,
    express: server
});

const template = nunjucks.precompile(
    './templates/base.njk',
    {name: "base"}
);

server.get('/', (req, res) => {
    res.render('home.njk', {user: req.session.user}) ;
});

server.get('/login', (req, res) => { 
    res.render('login.html', {user: req.session.user}); 
});

server.get('/sign-up', (req, res) => {
    res.render('sign_up.html', {user: req.session.user});
});

server.use('/api/search', searchRouter);
server.use('/api/authenticate', authenticateRouter);
server.use('/api/profile', usersOnlyMiddleware, profileRouter);

module.exports = server;