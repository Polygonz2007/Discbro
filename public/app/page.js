
//
//  page.js
//
//  This script has functions for displaying, updating and removing various HTML elements on the page.
//  Used by comms.js for displaying channels, servers, users, messages, etc.
//

// Servers
const server_list = doc.querySelector("#servers");

export function create_server(id, name, image) {
    console.log(`Making server ID #${id} in HTML`)
    server_list.innerHTML += `<img src="${image}" server_id="${id}" server_name="${name}" alt="${name}" />`;
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

    if (image != null)
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

