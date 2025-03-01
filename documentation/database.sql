create table users (
    -- Account data
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   username varchar(32), -- @username, can only conatin a-z, 0 - 9, underscore and dash. ^[a-z0-9-_]+$ has to be unique, and atleast 4 characters long.
   display_name varchar(48), -- displayname, can contain any character
   password varchar(60), -- 60 for hash

   -- Fun stuff
   status UNSIGNED INT, -- 0: offline, 1: online, 2: AFK, 3: do not disturb, 4: disturb (wants to talk to someone)
                        -- 0: gray, 1: green, 2: yellow, 3: red, 4: cyan
   status_text varchar(64), -- any text that shows on profile temporarily
   bio varchar(128), -- user describes themselves
   profile_picture varchar(128),
    -- profile picture is stored in "public/data/profile_pictures" folder, where each file is named "user-(id).png"
    -- default profile picture is "default.png" which is the discbro logo with colors behind it
    -- every profile picture should be max 256x256

    theme TINYINT -- 0: default, 1: midnight, 2: light, more to be added
);

create table friends (
    -- Each pair of friends gets a dm, as a "friend_group" with two members
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id UNSIGNED INT NOT NULL, -- user1 is the one who sent the request
    user2_id UNSIGNED INT NOT NULL,
    status UNSIGNED INT -- 0: pending, 1: accepted
);

create table channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name varchar(127) NOT NULL
);

create table messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id UNSIGNED INT NOT NULL,
    author_id INT NOT NULL,
    content varchar(2048) NOT NULL,
    time UNSIGNED INT NOT NULL DEFAULT (strftime('%s', 'now')),

    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (channel_id) REFERENCES channels(id)
);