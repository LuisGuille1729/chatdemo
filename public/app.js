console.log("test");

const socket = io("http://10.29.179.212:3000/");

console.log(socket);

// Query DOM
let channel = document.querySelector('input[name="channels"]:checked');
const message = document.getElementById("message");
const user = document.getElementById("user");
const btn = document.getElementById("send");
const output = document.getElementById("output");

socket.on("hello", (arg) => {
    console.log(arg);
});

btn.addEventListener("click", () => {
    channel = document.querySelector('input[name="channels"]:checked');
    console.dir(channel.value);

    if (user.value.length >= 2 && message.value.length >= 1 && ["1", "2", "3"].includes(channel.value)) {
        user.disabled = true;
        socket.emit("newMessage", { user: user.value, msg: message.value, channel: parseInt(channel.value) });
    } else {
        alert("Username should be at least 2 characters; message should be non-empty.");
    }
});

socket.on("newMessage", (data) => {
    console.log(data);
    console.dir(output);

    output.innerHTML += "<p><strong>" + data.user + "</strong> :" + data.msg + "</p>";
});

socket.on("chatJoin", () => {
    output.innerHTML += "<p><em> A new user has joined the chat. <em></p>";
});

const channel1 = document.getElementById("channel1");
