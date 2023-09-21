const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { users } = require("./data");
// const { v4: uuid } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("login", (data) => {
    const userExists = users.find((user) => user.username === data.username);
    if (userExists) {
      const otherusers = users.filter((user) => user.id !== userExists.id);
      socket.emit("loggedin", {
        username: userExists.username,
        id: userExists.id,
      });
      socket.emit("otherusers", otherusers);
    } else {
      socket.emit("nouser", { msg: "No user found" });
    }
  });
  socket.on("chatwithuser", (id) => {
    const user = users.find((user) => user.id == id.user);
    const otherpartner = users.find((user) => user.id == id.other);
    if (user && otherpartner) {
      const roomid = `${user.id + otherpartner.id}`;
      socket.join(roomid);
      socket.emit("partner", { user, otherpartner });
      socket.on("chatmessage", (data) => {
        io.sockets.in(roomid).emit("message", data);
      });
    }
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const port = process.env.PORT || 3500;

server.listen(port, () => {
  console.log("server running on port " + port);
});
