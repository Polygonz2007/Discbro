
const port = 2337; // port used for WebSocket
const url = `ws://${window.location.host}`;

const doc = document;
const root = doc.querySelector(":root");
const body = doc.body;
const socket = new WebSocket(url);

const state = {
	channelid: 1,
	lastid: Infinity,
	new_chunk: null
}

console.log(`Connecting on ${url}...`);

// Sending messages
let message_box = doc.querySelector("#message-box");
let messages = doc.querySelector("body");

socket.addEventListener("open", (event) => {
	// Connected, set up event listener
	message_box.addEventListener("keydown", (e) => {
		if (e.key == 'Enter') {
		  sendMessage();
		}
	  });

	  return;
});

socket.addEventListener("message", (event) => {
	// Handle received message
	const data = JSON.parse(event.data);
	console.log(`Parsing ${data.length} message(s) from ${url} at ${now()}`);

	const chunk = doc.createElement("div");
	chunk.classList = "chunk";
	for (let i = 0; i < data.length; i++) {
		addMessage(data[i], chunk); // Loop, when multiple messages arrive at once (at start)
	}

	const last = doc.querySelector("div.chunk");
	if (!last)
		body.append(chunk);
	else
		body.insertBefore(chunk, last);
	
	scroll(0, Infinity);

	return;
});

socket.addEventListener("close", (event) => {
	// Handle connection close
	console.warn(`Connection to WebSocket lost. [${now()}]`);

	return;
});

function addMessage(data, chunk) {
	console.log(data);

	// Translate to local time
	const date = new Date(data.time * 1000);
	data.time = date.toLocaleString("en-GB");

	// Write into messages div
	chunk.innerHTML  += `<div class="message" id="M${data.id}" >
								<img src="/data/profile_pictures/default.png" />
								<div>
									<p class="author">${data.author}</p>
									<p class="timestamp">${data.time}</p>
									<p class="content">${data.content}</p>
								</div>
							</div>`;

	if (data.id < state.lastid)
		state.lastid = data.id;
}

function sendMessage() {
	console.log("Posting message.");

	// Get data
	const content = message_box.value;

	if (content.replace(/\s+/g, '') === "")
		return; // cant send empty message

	// Send
	const data = { "type": "send", "content": content };
	const send = JSON.stringify(data);

	socket.send(send);

	// Clear box
	message_box.value = "";
}

function get_chunk() {
	console.log("Getting chunk.");

	// Get
	let data = { "type": "get", "channelid": state.channelid, "dir": false, "lastid": state.lastid };
	data = JSON.stringify(data);

	socket.send(data);
}

root.setAttribute("theme", "midnight");
scroll(0, Infinity);

window.addEventListener("scroll", () => {
	let chunks = doc.querySelectorAll("div.chunk");
	let load = true;

	chunks.forEach((chunk) => {
		const rect = chunk.getBoundingClientRect();
		
		if (rect.top < 0)
			load = false;
	});

	if (load)
		get_chunk();
});

// Functions (move to another file at some point)
function now() {
	const date = new Date();

	return date.toLocaleTimeString();
}