const path = require("path");

const express = require("express");
const app = express();

const { createServer } = require("http");
const httpServer = createServer(app);

// console.log(httpServer);

const { Server } = require("socket.io");
// if user connection has different address, then need to change cors permissions
// const io = new Server(httpServer, {
//     cors: {
//         origin: { origin: "*" },
//     },
// });
const io = new Server(httpServer);

// app.listen won't work because it also makes a new server
httpServer.listen(3000);

const channels = [[], [], []];
const users = {};

// let newMessage = "";

function broadcastNewMessage(channel, message) {
    channels[channel].push(message);
    io.emit("newRawMessage", message);
}

io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    // add user to data, transmit join message
    users[socket.id] = { id: socket.id, username: socket.id.toString().slice(0, 7), channel: 1 };
    const userData = users[socket.id]; // make an alias
    // newMessage = "<p><em> A new user [#" + userData.username + "] has joined the chat. <em></p>";
    // channels[userData.channel].push(newMessage);
    // io.emit("newRawMessage", newMessage);
    broadcastNewMessage(userData.channel, "<p><em> A new user [#" + userData.username + "] has joined the chat. <em></p>");

    socket.on("newMessage", (data) => {
        console.log(`[${data.channel}] ${data.user}: ${data.msg}`);

        channels[data.channel];
        io.emit("newMessage", data);
    });

    socket.on("joinChannel", (channelId) => {
        console.log(channelId);
    });
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// app.use(express.static("/public"));
app.use(express.static(path.join(__dirname, "/public"))); //serves static files for use

app.get("/", (req, res) => {
    res.render("home");
});
