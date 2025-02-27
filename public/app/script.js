
const port = 2337; // port used for WebSocket
const url = `ws://${window.location.host}`;

const doc = document;
let root = doc.querySelector(":root");
const socket = new WebSocket(url);

console.log(`Connecting on ${url}...`);

// Sending messages
let message_box = doc.querySelector("#message-box");
let messages = doc.querySelector("body");

socket.onopen = (event) => {
	// Connected, set up event listener
	message_box.addEventListener("keydown", (e) => {
		if (e.key == 'Enter') {
		  sendMessage();
		}
	  });
};

socket.onmessage = (event) => {
	console.log(`Received data from ${url}. [${now()}]`);

	// Handle received message
	const data = JSON.parse(event.data);

	for (let i = data.length - 1; i >= 0; i--) {
		addMessage(data[i]); // Loop, when multiple messages arrive at once (at start)
	}
};

socket.onclose = (event) => {
	// Handle connection close
	console.warn(`Connection to WebSocket lost. [${now()}]`);
};

function addMessage(data) {
	// Translate to local time
	const date = new Date(data.time * 1000);
	data.time = date.toLocaleString("en-GB");

	// Write into messages div
	messages.innerHTML += `<div class="message" >
								<img src="/data/profile_pictures/default.png" />
								<div>
									<p class="author">${data.author}</p>
									<p class="timestamp">${data.time}</p>
									<p>${data.content}</p>
								</div>
							</div>`;

	message_box.addEventListener("keydown", (e) => {
		if (e.key == 'Enter') {
			// Enter pressed
			sendMessage();
		}
		});
}

function sendMessage() {
	console.log(`Posting message.`);

	// Get data
	const content = message_box.value;

	if (content.replace(/\s+/g, '') === "")
		return; // cant send empty message

	// Send
	const data = { "content": content };
	const send = JSON.stringify(data);

	socket.send(send);

	// Clear box
	message_box.value = "";
}

root.setAttribute("theme", "midnight");



// Functions (move to another file at some point)
function now() {
	const date = new Date();

	return date.toLocaleTimeString();
}