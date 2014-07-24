var fs = require("fs");
var host = "127.0.0.1";
var port = 5000;
var express = require("express");

var clients = 0;

var app = express();
//app.use(app.router); //use both root and other routes below
app.use(express.static(__dirname + "")); //use static files in ROOT/public folder

app.get("/", function(request, response){ //root dir
    response.send("Hello!!");
});

console.log("hi heroku");

var io = require('socket.io').listen(app.listen(process.env.PORT || port));

io.sockets.on('connection', function (socket) {

    socket.on('firstConnect', function (data) {
        io.sockets.emit('imConnected', {clientnumber: clients});
        clients++;
    });
    socket.on('move', function (data) {
        io.sockets.emit('someoneMoved', data);
    });
    socket.on('bulletmove', function (data) {
        io.sockets.emit('someoneMovedBullet', data);
    });
    socket.on('bulletdestroy', function (data) {
        io.sockets.emit('someoneDestroyedBullet', data);
    });
});