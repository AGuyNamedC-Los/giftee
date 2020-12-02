require('dotenv').config();
const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const usersDB = require('../models/dbHelpers');
const setupMiddleware = require('../authentication/setupMiddleware');
const usersOnly = require('../authentication/usersOnlyMiddleware');
const authenticateRouter = require('../authentication/authentication-routes');
const profileRouter = require('../routes/profile-routes');
const searchRouter = require('../routes/search-routes');

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
server.use('/api/profile', usersOnly, profileRouter);

// DELETE EVERYTHING BELOW WHEN PUSHING TO PRODUCTION MODE

server.get('/users', (req, res) => {
    usersDB.find()
        .then(users => {
            res.status(200).json(users[0].username)
        })
        .catch(err => {
            res.status(500).json({message: "Some weird probably finding users"})
        })
});

server.post('/add-gift', (req, res) => {
    usersDB.addGift("closcastillo95@gmail.com", {
        itemName: "gift name",
        notes: "place holder notes",
        price: "20",
        quantity: "3",
        size: "big",
        storeLink: "asdasd"
    })
        .then(gift => {
            res.status(200).json(gift);
        })
        .catch(err => {
            res.status(500).json({error: "couldnt add gift"});
        })
})

server.post('/add-gift2', (req, res) => {
    usersDB.addGift("closcastillo@gmail.com", {
        itemName: "gift name",
        notes: "place holder notes",
        price: "20",
        quantity: "3",
        size: "big",
        storeLink: "asdasd"
    })
        .then(gift => {
            res.status(200).json(gift);
        })
        .catch(err => {
            res.status(500).json({error: "couldnt add gift"});
        })
})

server.get('/show-gifts', (req,res) => {
    usersDB.findUserByEmail("closcastillo95@gmail.com")
        .then(user => {
            res.status(200).json(eval(user.giftList))
        })
        .catch(err => {
            res.status(500).json({error: "could not display gifts"})
        })
})

server.get('/delete-users', (req, res) => {
    usersDB.deleteUserDB();
    res.json({message: "deleted"})
});

server.get('/upgrade', (req, res) => {
    usersDB.upgradeUser("closcastillo95@gmail.com")
        .then(user => {
            res.status(200).json({message: "upgraded user"})
        })
        .catch(err => {
            res.status(500).json({message: "error upgrading user"})
        })
})

server.get('/upgrade2', (req, res) => {
    usersDB.upgradeUser("closcastillo@gmail.com")
        .then(user => {
            res.status(200).json({message: "upgraded user"})
        })
        .catch(err => {
            res.status(500).json({message: "error upgrading user"})
        })
})

module.exports = server;