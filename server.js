var fs = require("fs");
var host = "127.0.0.1";
var port = 5000;
var express = require("express");

//var clients = 0;

var roomclients = [0];

var app = express();
//app.use(app.router); //use both root and other routes below
app.use(express.static(__dirname + "")); //use static files in ROOT/public folder

app.get("/", function(request, response){ //root dir
    response.send("Hello!!");
});

console.log("hi heroku");

var io = require('socket.io').listen(app.listen(process.env.PORT || port));

io.sockets.on('connection', function (socket) {
    //console.log("connect");

    socket.on('firstConnect', function (data) {
       // console.log("connectia");
        var room = -1;
        for(var i =0; i < roomclients.length; i++)
        {
            if(roomclients[i] < 2)
            {
                if(room == -1)
                {
                    room = i;
                }
            }
        }

        if(room == -1)
        {
            roomclients.push(0);
            room = roomclients.length - 1;
        }
        socket.join(room.toString());
        console.log("connecting someone to room " + room.toString() + " with number " + roomclients[room].toString());
        io.sockets.emit('imConnected',{room: room, clientnumber: roomclients[room]});
        roomclients[room]++;
        //console.log(clients);
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
    socket.on('shield', function (data) {
        io.sockets.emit('someoneShielded', data);
    });
    socket.on('bulletBlocked', function (data) {
        io.sockets.emit('someoneBlocked', data);
    });
    socket.on('gameOver', function (data) {
        io.sockets.emit('gg', data);
        //clients = 0;
        roomclients[data.room] = 0;
    });

    socket.on('disconnect', function () {
        io.sockets.emit('dc', {});
    });
});