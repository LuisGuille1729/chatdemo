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

const channels = [["<p>Hello</p>", "<p> This is a test </p>"], [], ["<p>Saludos cordiales</p>"]];
const users = {};

// let newMessage = "";

//^ helper function: emit message and save to channels storage
function broadcastNewMessage(socket, channel, message, store = true, useEmit = false) {
    if (channel == "*") {
        if (store) {
            channels.forEach((chn) => {
                chn.push(message);
            });
        }
        io.in("channel" + 1).emit("newMessage", message);
        io.in("channel" + 2).emit("newMessage", message);
        io.in("channel" + 3).emit("newMessage", message);
    } else {
        if (store) {
            channels[channel - 1].push(message);
        }

        console.log(useEmit);
        if (useEmit) {
            io.in("channel" + channel).emit("newMessage", message);
        } else {
            socket.broadcast.in("channel" + channel).emit("newMessage", message);
        }
    }
}

//* ON CONNECTION
io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);
    socket.join("channel1");
    socket.emit("forgetData");
    loadChannelData(1);

    // add user to data, transmit join message
    users[socket.id] = { id: socket.id, username: "#" + socket.id.toString().slice(0, 7), channel: 1 };
    const userData = users[socket.id]; // make an alias
    broadcastNewMessage(socket, "*", "<p><em> A new user [" + userData.username + "] has joined the chat. <em></p>", false);

    socket.once("newMessage", (data) => {
        console.log("First message of", data.user);
        userData.username = data.user; // make username permanent
    });

    socket.on("newMessage", (data) => {
        console.log(`[${data.channel}] ${data.user}: ${data.msg}`);

        switch (data.msg) {
            case "/admin-clear":
                channels[userData.channel - 1] = [];
                io.in("channel" + userData.channel).emit("forgetData");
                // socket.emit("forgetData");
                broadcastNewMessage(socket, userData.channel, "<p><em> An admin has cleared the channel </em></p>", false, true);
                break;
            default:
                broadcastNewMessage(socket, userData.channel, "<p><strong>" + userData.username + "</strong>: " + data.msg + "</p>");
        }
    });

    // change channels
    socket.on("joinChannel", (channelID) => {
        console.log(userData.username + " switched to " + channelID);

        socket.leave("channel" + userData.channel);
        broadcastNewMessage(socket, userData.channel, "<p><em>" + userData.username + " has switched to channel " + channelID + "</em></p>", false);

        loadChannelData(channelID);

        socket.join("channel" + channelID);
        broadcastNewMessage(socket, channelID, "<p><em>" + userData.username + " has joined the channel </em></p>", false);

        userData.channel = channelID;
    });

    //^ Load Channel Data Helper
    function loadChannelData(channelID) {
        channels[channelID - 1].forEach((msg) => {
            socket.emit("newMessage", msg);
        });
    }

    // Broadcast if disconnected
    socket.on("disconnect", (socket) => {
        console.log(socket.id);
        broadcastNewMessage(socket, "*", "<p><em>" + userData.username + " has disconnected </em></p>", false);
        delete users[socket.id];
    });
});

// io.on("ping timeout", (socket) => {
//     console.log(socket.id);
//     broadcastNewMessage(socket, "*", "<p><em>" + users[socket.id].username + " has disconnected </em></p>");
//     delete users[socket.id];
// });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// app.use(express.static("/public"));
app.use(express.static(path.join(__dirname, "/public"))); //serves static files for use
app.use("/favicon.ico", express.static("favicon.ico"));

app.get("/", (req, res) => {
    res.render("home");
});
