create table users (
    -- Account data
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   username varchar(32), -- @username, can only conatin a-z, 0 - 9. has to be unique, and atleast 4 characters long.
   displayname varchar(48), -- displayname, can contain any character
   password varchar(60), -- 60 for hash

   -- Fun stuff
   status UNSIGNED INT, -- 0: offline, 1: online, 2: AFK, 3: do not disturb, 4: disturb (wants to talk to someone)
                        -- 0: gray, 1: green, 2: yellow, 3: red, 4: cyan
   statustext varchar(64), -- any text that shows on profile temporarily
   bio varchar(128), -- user describes themselves
   profilepicture varchar(128)
    -- profile picture is stored in "public/data/profile_pictures" folder, where each file is named "user-(id).png"
    -- default profile picture is "default.png" which is the discbro logo with colors behind it
    -- every profile picture should be max 256x256
);

create table friends (
    -- Each pair of friends gets a dm, as a "friend_group" with two members
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1id UNSIGNED INT NOT NULL, -- user1 is the one who sent the request
    user2id UNSIGNED INT NOT NULL,
    status UNSIGNED INT -- 0: pending, 1: accepted
);

create table groups (
    -- Used for group dms since all channels are the same
    -- max 16 members
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name varchar(64), -- if null, the group shows up as "member1displayname, member2displayname, ..."
    image varchar(128), -- url to image in assets folder
    ownerid UNSIGNED INT
);

create table group_members (
    -- Responsible for connecting members to their groups
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    groupid UNSIGNED INT,
    userid UNSIGNED INT,

    FOREIGN KEY (groupid) REFERENCES groups(id),
    FOREIGN KEY (userid) REFERENCES users(id)
);

create table messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channelid UNSIGNED INT NOT NULL,
    content varchar(2048) NOT NULL,
    author UNSIGNED INT NOT NULL,
    timesent TIMESTAMP NOT NULL
);