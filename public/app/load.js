// Responsible for loading in chunks when scrolling / changing channel / whateverelse.

const settings = {
    max_chunks: 8,
	chunk_size: 32
}

let data = {
    chunks: [],
    chunk_index: 0,

    oldest_chunk: 0,
    newest_chunk: 0,

    has_oldest: false,
    has_newest: false
}

// HTML Assets
function message_with_header(message) {
    return `<div class="message" id="M${message.id}" >
				<a href="/app/user/${message.author.username}"><img src="/data/profile-pictures/default.png" class="pfp"></img></a>
				<div>
					<a class="author" href="/app/user/${message.author.username}">${current.author.display_name} [@${current.author.username}]</a>
					<p class="timestamp">${message.time_date}</p>
					<p class="content">${message.content}</p>
				</div>
			</div>`;
}

function message(message) {
    return `<div class="message detached" id="M${message.id}" >
					<p class="content detached">${message.content}</p>
			</div>`;
}

function date_seperator(time) {
    return `<span>${time.toLocaleDateString('en-GB', {month: 'long', day: 'numeric', year: 'numeric'})}</span>`;
}


// Display and handle stuff
function create_chunk(id) {

}