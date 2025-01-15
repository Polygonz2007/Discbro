const port = 2337; // port used for WebSocket

const doc = document;
const socket = new WebSocket('ws://127.0.0.1:' + port);

let button = doc.querySelector("#button");
let counter = doc.querySelector("h3");

socket.onopen = (event) => {
    // Handle connection open
    sendMessage(JSON.stringify({"userid": 123}));

    button.addEventListener("click", () => {
        sendMessage(JSON.stringify({"+": "1"}));
    });
};

socket.onmessage = (event) => {
  // Handle received message
   counter.innerText = "Count: " + event.data;
};

socket.onclose = (event) => {
  // Handle connection close
  clickEvent = null;
};

function sendMessage(message) {
  socket.send(message);
}
