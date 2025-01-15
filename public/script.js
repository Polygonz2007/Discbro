const port = 2337; // port used for WebSocket

const doc = document;
const socket = new WebSocket('ws://127.0.0.1:' + port);

let message_field = doc.querySelector("#message");
let author_field = doc.querySelector("#author");
let send_btn = doc.querySelector("#send");

let messages = doc.querySelector("#messages");


socket.onopen = (event) => {
	// Handle connection open
	send_btn.addEventListener("click", () => {
		const content = message_field.value;
		const author = author_field.value;

		sendMessage(content, author);
	});
};

socket.onmessage = (event) => {
	// Handle received message
	const data = JSON.parse(event.data);

	for (let i = 0; i < data.length; i++) {
		addMessage(data[i]); // Loop, when multiple messages arrive at once (at start)
	}
};

socket.onclose = (event) => {
	// Handle connection close
};

function addMessage(data) {
	// Remove any HTML-esque stuff that could be scary


	// Write into messages div
	messages.innerHTML += `<div><p><b>${data.author}</b> - ${data.time}</p><p>${data.content}</p></div>`;
}

function sendMessage(content, author) {
	const data = { "content": content, "author": author };
	const send = JSON.stringify(data);

	socket.send(send);
}
