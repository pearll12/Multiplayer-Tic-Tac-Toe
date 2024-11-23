const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "http://localhost:5174/",
});

const allUsers = {};

io.on("connection", (socket) => {
  //   console.log(socket);
  // console.log("New user joined websocket " + socket.id);
  allUsers[socket.id] = {
    socket: socket,
    online: true,
    playing: false,
  };
  console.log("connected", socket.id);
  socket.on("request_to_play", (data) => {
    currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;

    let opponentPlayer = null;
    for (const key in allUsers) {
      const user = allUsers[key];
      if (
        user.online &&
        user.playerName &&
        !user.playing &&
        key !== socket.id
      ) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {
      opponentPlayer.socket.emit("OpponentFound", {
        opponentName: currentUser.playerName,
        playingAs: "circle",
      });
      currentUser.socket.emit("OpponentFound", {
        opponentName: opponentPlayer.playerName,
        playingAs: "cross",
      });

      currentUser.socket.on("playerMoveFromClient", (data) => {
        opponentPlayer.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });

      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        currentUser.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
    } else {
      currentUser.socket.emit("OpponentNotFound");
    }
  });

  socket.on("disconnect", function () {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
  });
});

httpServer.listen(3000);
