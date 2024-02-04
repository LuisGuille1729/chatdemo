console.log("test");

const socket = io("http://10.29.179.212:3000/");

console.log(socket);

// Query DOM
let activeChannel = document.querySelector('input[name="channels"]:checked');
const message = document.getElementById("message");
const user = document.getElementById("user");
const btn = document.getElementById("send");
const output = document.getElementById("output");

socket.on("hello", (arg) => {
    console.log(arg);
});

// Send message on submit click
btn.addEventListener("click", () => {
    activeChannel = document.querySelector('input[name="channels"]:checked');
    console.dir(activeChannel.value);

    if (user.value.length >= 2 && message.value.length >= 1 && ["1", "2", "3"].includes(activeChannel.value)) {
        user.disabled = true;
        socket.emit("newMessage", { user: user.value, msg: message.value, channel: parseInt(activeChannel.value) });
    } else {
        alert("Username should be at least 2 characters; message should be non-empty.");
    }
});

// Update data when receive a new message
socket.on("newMessage", (data) => {
    console.log(data);
    console.dir(output);

    output.innerHTML += "<p><strong>" + data.user + "</strong> :" + data.msg + "</p>";
});

// Add any raw message
socket.on("newRawMessage", (message) => {
    output.innerHTML += message;
});

// Send request to change channel
const channelsCount = 3;
const channels = [];
for (let i = 1; i <= channelsCount; i++) {
    channels.push(document.getElementById("channel" + i));
}

console.log(channels);

channels.forEach((channel) => {
    channel.addEventListener("click", () => {
        if (channel.value != activeChannel.value) {
            activeChannel = channel;
            socket.emit("joinChannel", channel.value);
        }
    });
});
