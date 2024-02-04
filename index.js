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

io.on("connection", (socket) => {
    console.log("Connected", socket.id);

    socket.emit("chatJoin");

    socket.on("newMessage", (data) => {
        console.log(`[${data.channel}] ${data.user}: ${data.msg}`);

        channels[data.channel];
        io.emit("newMessage", data);
    });
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// app.use(express.static("/public"));
app.use(express.static(path.join(__dirname, "/public"))); //serves static files for use

app.get("/", (req, res) => {
    res.render("home");
});
