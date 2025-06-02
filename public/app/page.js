
//
//  page.js
//
//  This script has functions for displaying, updating and removing various HTML elements on the page.
//  Used by comms.js for displaying channels, servers, users, messages, etc.
//

import * as comms from "./comms.js";

// Displaying info
// Divs
export const server_list = doc.querySelector("#servers");
export const channel_list = doc.querySelector("#channels");
export const message_box = doc.querySelector("#message-box");

// Info
export const server_name = doc.querySelector("#server-name");

// Buttons
export const create_server_btn = doc.querySelector("#create-server-button");
export const create_channel_btn = doc.querySelector("#create-channel-button");

// Servers
export function create_server(id, name, image) {
    server_list.innerHTML += `<img src="${image}" server_id="${id}" server_name="${name}" alt="${name}" title="${name}" onclick="window.app.open_server(${id})" />`;
    return true;
}

export function change_server(id, name, image) {
    const server = doc.querySelector(`[server_id=${id}]`);
    if (!server)
        return false;

    // Update it
    if (name != null) {
        server.setAttribute("server_name", name);
        server.setAttribute("alt", name);
    }

    if (image)
        server.setAttribute("src", image);

    return true;
}

export function remove_server() {
    const server = doc.querySelector(`[server_id=${id}]`);
    if (!server)
        return false;

    server.remove();
    return true;
}

// Channels
export function create_channel(channel) {
    const element = doc.createElement("li");
    element.classList.add("channel");
    element.setAttribute("channel_id", channel.id);
    element.innerHTML = "#" + channel.name;

    channel_list.appendChild(element);
    return element;
}

export async function display_server(server_id) {
    // Get channels, and add to HTML. Also open first channel
    const server_name = doc.querySelector(`[server_id="${server_id}"]`).getAttribute("server_name");
    doc.querySelector("#server-name").innerHTML = server_name;

    // Get channels
    const { channels } = await comms.ws_req("get_channels", {"server_id": server_id});
    if (!channels) {
        channel_list.innerHTML = "<p>This server has no channels.</p>";
        return false;
    }

    // Display them
    channel_list.innerHTML = "";
    for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        const element = create_channel(channel);

        element.addEventListener("click", () => { display_channel(channel.id); });
    }

    return true;
}


// Channels
export async function display_channel(channel_id) {
    // Get data about channel?


    // Start the message loader thingamajig
    comms.ws_req("get_messages", {"channel_id": channel_id, "dir": true, "amount": 32});

    return true;
}

// Messages
export function create_message(message) {
    // Get data stuff
    const author = message.author; // get from somehwree else maybe
    const user_link = `/app/user/${message.author.username}`;

    const datetime = new Date(message.time * 1000);
    const timestamp = datetime.toLocaleString();

    // Create the message
    const container = doc.createElement("div");
    container.classList.add("message");
    container.setAttribute("message_id", message.id);

    // User image
    const image_link = doc.createElement("a");
    image_link.setAttribute("href", user_link);

    const image = doc.createElement("img");
    image.setAttribute("src", `/data/user-image/${author.id}.png`);
    image.classList.add("pfp");

    // Message itself
    const text_container = doc.createElement("div");

    const author_text = doc.createElement("a");
    author_text.classList.add("author");
    author_text.setAttribute("href", user_link);
    author_text.innerHTML = `${author.display_name} [@${author.username}]`;

    const timestamp_text = doc.createElement("p");
    timestamp_text.classList.add("timestamp");
    timestamp_text.innerHTML = timestamp;

    const content_text = doc.createElement("p");
    content_text.classList.add("content");
    content_text.innerHTML = message.content;

    // Add it all togheter
    image_link.appendChild(image);
    container.appendChild(image_link);

    text_container.appendChild(author_text);
    text_container.appendChild(timestamp_text);
    text_container.appendChild(content_text);
    container.appendChild(text_container);

    body.appendChild(container);

    return container;
}

export function clear_messages() {
    // Remove all messages on screen
    const old_messages = doc.querySelectorAll(".message");
    for (let i = 0; i < old_messages.length; i++) {
        old_messages[i].remove();
    }

    return true;
}