
# WebSockets

How websockets work and function idk



# Full list of functions for communication.
This section explains what each request type does.

How this all works is that the client has a cache of stuff (servers, channels, users, message chunks) and the client can request all new info for all of these, or if already present, can just request updates from the server.

On the server it keeps track of what users are expecting which updates, so for example if a user goes offline the server knows who has that user loaded and tells all of them "Hey, [ID] just went offline." or "They changed their profile_pic you should update it"


## Client -> Server
get_servers (user_id) (id, name, image)
get_server (id, name, image, description, num_members, created_date) (can only be called if you have valid invite code)

get_server_channels (user_id) (id, name) { category1: {c1, c2, c3}, category2: {c4, c5}} ... (each c is only id and name)
get_server_channel (id, name, description, roles) (roles to display only members with access)
(you need to be in server to run this)

get_server_roles (user_id) (id, name, color, rules) (used to get both your own and others roles)
(you need to be in server to run this)

get_server_members (amount, anchor, filter)
- amount and offset let client get only whats nesecarry (streaming chunks, like messages)
- anchor is anything over anchor is ignored, like an offset
- filter lets client search for specific stuff (search by name, show only people with role, show only friends, etc)

get_message_chunk (channel_id, amount, anchor, direction) (you need acces to channel to run this)
- if direction is true (newer) and anchor is 0, gets the newest messages.
- if anchor is not 0, is fetches only messages above or below anchor (depending on direction)

add_server (name, image, description, etc.)
update_server (changes, like uploading an image)
delete_server (...)

add_channel (name, category, description, etc.)
update_channel (changes)
delete_channel (...)

add_message
update_message (editing)
delete_message

add_role (only admins)
update_role (only admins)
delete_role (only admins) (must also remove roles from members first)


## Server -> Client
### For when information changes, and the client needs to know.
server_added (you joined server) (use cache, because you must have seen info about it before joining)
server_updated (it changed)
server_deleted (server gone)

channel_added (category_id, name)
channel_updated (changes)
channel_deleted (remove it)

message_added (author_id, content, etc.)
message_changed (edited, reacted to, etc.)
message_deleted (remove it)

member_added (to server) (run get_user if not seen before, ask for updates either way)
member_changed (roles changed)
member_deleted (from server)

role_added (id, name, color, perms)
role_changed (changes)
role_deleted (remove it, and from all users)

user_changed (user in cache updated name, profile, status, osv) (send only changes!)

friend_added (someone sent request to you)
friend_changed (when a user accepted or blocked you)
friend_deleted (when a user declined your request)



Since the server knows which servers, channels, friends, etc. the user has ever interacted with, it also knows what updates to send out. When information changes, the server figures out which users are affected and need the update, and gives it to them instantly. This also lets the client decide what notifications should be sent.