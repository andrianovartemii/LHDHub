const express = require('express');
const mysql = require("mysql2");
var app = express();
var http = require('http').createServer(app);
var port = 3000;
var socketio = require('socket.io')(http);

class User {

  constructor(id, nick, pass, score) {
    this.id = id;
    this.nick = nick;
    this.pass = pass;
    this.score = score;
  }
}

class Coin {
  constructor(id, posX, posY, count, factor) {
    this.id = id;
    this.posX = posX;
    this.posY = posY;
    this.count = count;
    this.factor = factor;
  }
  setFactor(factor)
  {
    this.factor = factor;
  }
}
class Player
{
  constructor(socketId, id, posX, posY) {
    this.socketId = socketId;
    this.id = id;
    this.posX = posX;
    this.posY = posY;
  }
  set(posX, posY)
  {
    this.posX = posX;
    this.posY = posY;
  }
}

var extrasdb = [];

var usersdb = [];
usersdb.push(new User(0, "Artemii", "1111", 0));
usersdb.push(new User(1, "Admin", "2222", 0));
usersdb.push(new User(2, "Bill", "3333", 0));
usersdb.push(new User(3, "John", "4444", 0));
usersdb.push(new User(4, "Max", "5555", 0));

var users = [];
app.use(express.static(__dirname + '/public'));
app.get('/public/', function(req, res){
  res.sendFile(__dirname + 'gamehub.html');
});

http.listen(port, function(){
  console.log("listening on *: " + port);
});

socketio.on('connection', function(socket){
  console.log("New client has connected with id:",socket.id);
  socket.on('spawn',function(data){
    socketio.in(socket.id).emit('getgameState', users);
    users.push(new Player(socket.id, data.id, data.posX, data.posY));
    console.log("spawn: " + socket.id + "  " + data.id);
    socket.broadcast.emit('instance', data);
  });
  socket.on('refresh',function(data){
    for(var i = 0; i < users.length; i++)
    {
      if(users[i].id == data.id){ users[i].set(data.posX, data.posY);
        break;
      }
    }
    console.log("refresh: " + socket.id + "  " + data);
    socket.broadcast.emit('refresh', data);
  });
  socket.on('disconnect', function(){
    for(var i = 0; i < users.length; i++){
      if(socket.id == users[i].socketId){
        socket.broadcast.emit('disconnectsmb', users[i]);
        users.splice(i);
        break;
      }
    }
      console.log(socket.id + " is disconnect!");
    });

    socket.on('login', function(data){
      for(var i = 0; i < usersdb.length; i++){
        if(data.nick == usersdb[i].nick)
        if(data.pass == usersdb[i].pass){
          socketio.in(socket.id).emit('loginRep', {id:usersdb[i].id});
          break;
        }
        else
        {
          socketio.in(socket.id).emit('loginWrong');
          break;
        }
      }
    });
  });
