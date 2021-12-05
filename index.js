require('dotenv').config();
var server = require('./api/server');
var PORT = process.env.PORT || 2323;

server.listen(PORT, function () {
    console.log("Server running on http://localhost:" + PORT);
});