const port = 2337; // port used for WebSocket
const load_new_dist = 200; // distance to top to load old messages
const load_amount = 50; // amount of messages to load on scroll

const doc = document;
let root = doc.querySelector(":root");
const socket = new WebSocket('ws://127.0.0.1:' + port);

// Selecting theme
let checkboxes = doc.querySelectorAll("#theme-select > li > input");

checkboxes.forEach((checkbox) => {
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
	// Remove any HTML-esque stuff that could be scary


	// Write into messages div
	const new_id = last_message + 1;
	let last_message_element = doc.querySelector(`#msg${last_message}`);

	if (last_message_element) {
		if (data.author == last_message_element.getAttribute("author")) {
			last_message_element.innerHTML += `<p class="message">${data.content}</p>`;
			return;
		}
	}
	
	const highlight = (data.author == "System") ? `class="highlight"` : "";
	messages.innerHTML += `<div id="msg${new_id}" author="${data.author}" ${highlight}>
								<p class="author">${data.author}</p>
								<p class="timestamp">${data.time}</p>
								<p class="message">${data.content}</p>
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