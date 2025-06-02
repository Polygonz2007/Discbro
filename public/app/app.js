//
//  app.js
//
//  Responsible for actually running the app. Loading stuff, handling sending of messages, clicking stuff, etc.
//

import * as page from "./page.js";
import * as comms from "./comms.js";
import { Form } from "./form.js";

const App = new class {
    constructor() {
        // Settings
        this.settings = {};
        this.settings.messages_per_chunk = 32;

        // Channel map, aka cache data
        this.channel_map = []; // Servers -> Channels

        // Must be recalculated when adding / removing a chunk
        this.state = {};
        this.state.oldest_message_id = Infinity;
        this.state.newest_message_id = 0;

        this.max_messages_loaded = 128;
    }

    async init() {
        console.log("HEI")

        // Wait for websockets to load
        console.log(comms.ready)
        await comms.ready;
        console.log(comms.ready)

        // Get user
        const { user } = await comms.ws_req("get_user") // no params, so it returns ourselves

        this.user = user;
        doc.querySelector("#displayname").innerHTML = user.display_name;
        doc.querySelector("#username").innerHTML = `@${user.username}`;
        doc.querySelector("#profile-picture").src = `/data/user-image/${user.id}.png`;

        doc.querySelector("#account").href = `/app/user/${user.username}`;

        // Get servers
        const { servers } = await comms.ws_req("get_servers");
        this.servers = servers;

        // Display them
        for (let i = 0; i < this.servers.length; i++) {
            const server = this.servers[i];
            page.create_server(server.id, server.name, server.image);
        }

        // Open first one
        this.open_server(this.servers[0].id);
    }

    async open_server(server_id) {
        // Set it to be opened
        this.state.server = server_id;
        page.server_name.innerHTML = "";

        // Get channels
        const { channels } = await comms.ws_req("get_channels", {"server_id": server_id});
        if (!channels) {
            page.channel_list.innerHTML = "There are no channels here yet.";
            page.clear_messages();
            return false;
        }

        page.channel_list.innerHTML = "";
        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            const element = page.create_channel(channel);
            element.addEventListener("click", () => { this.open_channel(channel.id); });
        }

        // Open first one (replace wirh last opened afterwards)
        this.open_channel(channels[0].id);
    }

    async open_channel(channel_id) {
        // Check if we have permissions to see the channel, and find which server it is in


        // Check if server is opened, if not open it
        //this.open_server();
        this.state.channel = channel_id;

        // Highlight this channel, unhighlight any old one
        const prev_open = doc.querySelector(`.channel[open]`);
        if (prev_open)
            prev_open.removeAttribute("open");

        const channel = doc.querySelector(`.channel[channel_id="${channel_id}"`);
        if (!channel)
            return false; // wtf

        channel.setAttribute("open", "");

        // Change text in channel view
        doc.querySelector("#channel-name").innerHTML = channel.innerHTML;

        // Reload messages
        this.reload_messages();
    }

    // Messages
    reload_messages() {
        page.clear_messages();
        this.load_messages(true);
    }

    async load_messages(direction) {
        const anchor = (direction ? this.newest_message : this.oldest_message) || null;
        const { messages } = await comms.ws_req("get_messages", {"channel_id": this.state.channel, "direction": direction, "anchor": anchor, "amount": this.settings.messages_per_chunk });

        if (!messages)
            return false; //tf!

        for (let i = 0; i < messages.length; i++) {
            page.create_message(messages[i]);
        }

        return 0;
    }

    // Optimize these two in the future. Works for low amount of messages, sucks for many.
    get oldest_message() {
        const messages = doc.querySelectorAll(".message");
        if (messages.length == 0)
            return false;

        let oldest_idx = 0; let oldest_id = Infinity;

        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const message_id = message.getAttribute("message_id") || Infinity;
            if (message_id < oldest_id) {
                // New oldest message!
                oldest_id = message_id;
                oldest_idx = i;
            }
        }

        // We now have oldest message
        return {"element": messages[oldest_idx], "id": oldest_id};
    }

    get newest_message() {
        const messages = doc.querySelectorAll(".message");
        if (messages.length == 0)
            return false;

        let newest_idx = 0; let newest_id = 0;

        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const message_id = message.getAttribute("message_id") || 0;
            if (message_id > oldest_id) {
                // New oldest message!
                newest_id = message_id;
                newest_idx = i;
            }
        }

        // We now have oldest message
        return {"element": messages[newest_idx], "id": newest_id};
    }

    // Interaction
    async post_message() {
        // Check that we can
        if (!this.state.channel)
            return false;

        if (page.message_box.value == "")
            return false;

        // Compose data
        const params = {
            channel_id: this.state.channel,
            content: page.message_box.value
        };

        const { result } = await comms.ws_req("add_message", params);
        if (result) // Clear message box if it was sent
            page.message_box.value = "";

        return result;
    }
}

// Start it up
App.init();
window.app = App;

// Posting messages
page.message_box.addEventListener("keydown", (e) => {
	if (e.key == 'Enter') { App.post_message(); }
});

// creating server
page.create_server_btn.addEventListener("click", async () => {
    const form = new Form("Create Server", "Create!");
    form.add_input("text", "Server Name", "name", "The name of your server");
    // Add image, description n' stuff later

    const result = await form.query();
    console.log(result)
    comms.ws_req("add_server", result);
});

// creating channel
page.create_channel_btn.addEventListener("click", async () => {
    const form = new Form("Create Channel", "Create!");
    form.add_input("text", "Channel Name", "name", "The name of your server");
    // Add image, description n' stuff later

    const result = await form.query();
    console.log(result)
    comms.ws_req("add_server", result);
});