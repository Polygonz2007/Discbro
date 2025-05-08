
# WebSockets

How websockets work and function idk



# Usage
This section explains what each request type does


## Client to server requests

get_servers (server_id, server_name, server_icon):
  Returns a list of all servers user is part of

get_server_channels (channel_id, name, category):
  Returns a list of all channels in a server (category, id, name) that you have access to

get_server_members (user_id, username, displayname, profile_pic, status, bio / activity):
  Returns a list of all members of a server



## Server to client

show_channel (id, name, category):
  Display a new channel, that was either made or given permission to view

hide_channel (id):
  Remove a channel, that was either deleted og removed permissions for

user_status_change:
  A user you have in your chache changed status (online, offline, etc)




How this all works is that the client has a cache of stuff (servers, channels, users, message chunks) and the client can request all new info for all of these, or if already present, can just request updates from the server.

On the server it keeps track of what users are expecting which updates, so for example if a user goes offline the server knows who has that user loaded and tells all of them "Hey, [ID] just went offline." or "They changed their profile_pic you should update it"





Loading app:
- get_servers
- Add servers to server update list

User clicks on server:
- Get server channels
- Add server channels to cache, and server update list
- Get server members (first 64)
- Add members to user cache, add to server update list

User scrolls down member list:
- Get more server members

User clicks on channel:
- Get first chunk
- Add client to message update list for channel
- Load more chunks on scroll





## Terms in code functions
get: get data, either from server or cache, for use
add: add data to cache
update: update data stored in a cache
delete: delete data stored in a cache

create: make a new HTML element with info supplied
change: update a HTML element, either the info or the entire structure
remove: remove a HTML element