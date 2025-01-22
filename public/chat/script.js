const port = 2337; // port used for WebSocket
const load_new_dist = 200; // distance to top to load old messages
const load_amount = 50; // amount of messages to load on scroll

const doc = document;
let root = doc.querySelector(":root");
const socket = new WebSocket('ws://10.20.8.204:' + port);

// Selecting theme
let checkboxes = doc.querySelectorAll("#theme-select > li > input");

checkboxes.forEach((checkbox) => {
	// Set default theme
	if (checkbox.checked)
		root.setAttribute("theme", checkbox.id);

	checkbox.addEventListener("change", () => {
		// Only for the active one
		if (!checkbox.checked)
			return;

		root.setAttribute("theme", checkbox.id);

		// Uncheck others
		checkboxes.forEach((des) => {
			if (des != checkbox)
				des.checked = false;
		});
	});
});

// Sending messages
let message_field = doc.querySelector("#message-bar");
let author_field = doc.querySelector("#author");

let messages = doc.querySelector("#messages");
let last_message = 0;

socket.onopen = (event) => {
	// Handle connection open
	message_field.addEventListener("keydown", (e) => {
		if (e.key == 'Enter'){
		  // Enter pressed
		  sendMessage();
		}
	  });
};

socket.onmessage = (event) => {
	// Handle received message
	const data = JSON.parse(event.data);

	for (let i = 0; i < data.length; i++) {
		addMessage(data[i]); // Loop, when multiple messages arrive at once (at start)
	}

	// Scroll down
	messages.scrollTop = messages.scrollHeight;
};

socket.onclose = (event) => {
	// Handle connection close
};

function addMessage(data) {
	// Write into messages div
	const new_id = last_message + 1;
	messages.innerHTML += `<div class="message" >
								<img src="/data/profile_pictures/default.png" />
								<div>
									<p class="author">${data.author}</p>
									<p class="timestamp">${data.time}</p>
									<p>${data.content}</p>
								</div>
							</div>`;

	last_message = new_id;
}

function sendMessage() {
	// Get data
	const content = message_field.value;
	const author = author_field.value;

	if (content.replace(/\s+/g, '') === "")
		return; // camt send empty message

	// Send
	const data = { "content": content, "author": author };
	const send = JSON.stringify(data);

	socket.send(send);

	// Clear box
	message_field.value = "";
}

messages.addEventListener("scroll", () => {
	console.log(messages.scrollTop);
})