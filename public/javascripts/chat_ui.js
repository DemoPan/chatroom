function divEscapedContentElement(message) {
  return $("<div></div>").text(message);
}

function divSystemContentElement(message) {
  return $("<div></div>").html("<i>" + message + "</i>");
}

//处理原始的用户输入
function processUserInput(chatApp, socket) {
  var message = $("#send-message").val();
  var systemMessage;

  if (message.charAt(0) == "/") {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $("#messages").append(divSystemContentElement(systemMessage));
      // socket.emit("rooms");
    }
  } else {
    chatApp.sendMessage($("#room").text(), message);
    $("#messages").append(divEscapedContentElement(message));
    $("#messages").scrollTop($("#messages").prop("scrollHeight"));
  }

  $("#send-message").val("");
}

//客户端逻辑初始化
var socket = io.connect();

$(document).ready(function() {
  var chatApp = new Chat(socket);

  socket.on("nameResult", function(result) {
    var message;

    if (result.success) {
      message = "You are now know as " + result.name + ".";
    } else {
      message = result.message;
    }

    $("#messages").append(divSystemContentElement(message));
  });

  socket.on("joinResult", function(result) {
    $("#room").text(result.room);
    $("#messages").append(divSystemContentElement("Room changed."));
  });

  socket.on("message", function(message) {
    var newElement = $("<div></div>").text(message.text);
    $("#messages").appent(newElement);
  });

  socket.on("rooms", function(rooms) {
    $("#room-list").empty();

    for (var room in rooms) {
      room = room.substring(1, room.length);
      if (room != "") {
        $("#room-list").append(divEscapedContentElement(room));
      }
    }

    $("#room-list div").click(function() {
      chatApp.processCommand("/join " + $(this).text());
      $("#send-message").focus();
    });
  });

  setInterval(function() {
    socket.emit("rooms");
  }, 1000);

  // socket.emit("rooms");

  $("#send-message").focus();

  $("#send-form").submit(function() {
    processUserInput(chatApp, socket);
    return false;
  });
});
