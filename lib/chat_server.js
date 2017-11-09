// 设置Socket.IO 服务器

var socketio = require("socket.io");
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server) {
  io = socket.listen(server);
  io.set("log level", 1);

  io.socket.on("connection", function(socket) {
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed); // 用户连接上时，自动分配昵称
    joinRoom(socket, "Lobby");
    handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);

    socket.on("rooms", function() {
      socket.emit("rooms", io.socket.manager.rooms);
    });

    handleClientDisconnection(socket, nickNames, namesUsed);
  });
};

// 分配昵称
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  var name = "Guest" + guestNumber;
  nickNames[socket.id] = name;
  socket.emit("nameResult", {
    success: true,
    name: name
  });
  namesUsed.push(name);
  return guestNumber + 1;
}

// 进入聊天室

function joinRoom(socket, room) {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit("joinResult", { room: room });
  socket.broadcast.to(room).emit("message", {
    text: nickNames[socket.id] + " has joined " + room + "."
  });

  var usersInRoom = io.sockets.clients(room);

  if (usersInRoom.length > 1) {
    var usersInRoomSummary = "Users currently in " + room + ":";

    for (var index in usersInRoom) {
      var userSocketedId = usersInRoom[Index].id;
      if (userSocketedId != socket.id) {
        if (index > 0) {
          usersInRoomSummary += ", ";
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += ".";
    socket.emit("message", { text: usersInRoomSummary });
  }
}
