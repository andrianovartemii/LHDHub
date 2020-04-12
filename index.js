//mongoose.connect('mongodb+srv://admin:LocalHackDayStartsHere18@cluster0-bv7od.mongodb.net/users', {useNewUrlParser: true});
const express = require('express');
var app = express();
var http = require('http').createServer(app);
var port = 3000;
var socketio = require('socket.io')(http);
var fs = require('fs');


var usersdb = [];

function refreshUsersDb()
{
  let usersDbJSON = JSON.parse(fs.readFileSync("databases/users.json", 'utf8'));
  var counter = 0;
  for(user in usersDbJSON.users)
  {
    usersdb.push(usersDbJSON.users[counter]);
    counter++;
  }
}
//Object of corrent connection
class User {

  constructor(socketId, id, posX, posY) {
    this.socketId = socketId;
    this.id = id;
    this.posX = posX,
    this.posY = posY;
  }
  set(posX, posY)
  {
    this.posX = posX;
    this.posY = posY;
  }
}
//Connections array
var users = [];
//Send data with start
app.use(express.static(__dirname + '/public'));
app.get('/public/', function(req, res){
  res.sendFile(__dirname + 'gamehub.html');
});
//Listen
http.listen(port, function(){
  console.log("listening on *: " + port);
});
//Work with socket connection
socketio.on('connection', function(socket){
  //Connection new
  console.log("New client has connected with id:",socket.id);
  //Start spawn
  socket.on('spawn',function(data){
    socketio.in(socket.id).emit('getgameState', users);
    users.push(new User(socket.id, data.id, data.posX, data.posY));
    console.log("spawn: " + socket.id + "  " + data.id);
    socket.broadcast.emit('instance', data);
  });
  //Request on refresh user position
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
  //Responce everyone about disconect client
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
  //Request on login in data
  socket.on('login', function(data){
    refreshUsersDb();
    console.log(data.pass);
    for(var i = 0; i < usersdb.length; i++)
    {
      console.log(usersdb[i].name + " " + usersdb[i].pass);
      if(data.nick == usersdb[i].name){

        if(data.pass == usersdb[i].pass)
        {
          socketio.in(socket.id).emit('loginRep', usersdb[i]);
          break;
        }
        else
        {
          socketio.in(socket.id).emit('loginWrong');
          break;
        }
      }
    }
  });
  //Request on calculate extras score
  socket.on('extras', function(data){
    if(data.eType == 4)
    {
      socketio.in(socket.id).emit('extrasCoin', {score: 100});
    }
    if(data.eType == 3)
    {
      socketio.in(socket.id).emit('extrasQuestion', {question:"question", answer:"answer", wrong1:"wrong1", wrong2:"wrong2", wrong3:"wrong3"});
    }
    if(data.eType == 5)
    {
      socketio.in(socket.id).emit('extrasCheck', {status: 1})
    }
  });
});
