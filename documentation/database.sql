create table users (
    -- Account data
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   username varchar(32), -- @username, can only conatin a-z, 0 - 9. has to be unique, and atleast 4 characters long.
   display_name varchar(48), -- displayname, can contain any character
   password varchar(60), -- 60 for hash
   email varchar(255), -- for idk

   -- Fun stuff
   status UNSIGNED INT, -- 0: offline, 1: online, 2: inactive, 3: do not disturb, 4: disturb (wants to talk to someone)
                        -- 0: gray, 1: green, 2: yellow, 3: red, 4: cyan if active, blue if inactive
   status_text varchar(128), -- any text that shows on profile temporarily
   bio varchar(512), -- user describes themselves
   image varchar(128),
    -- profile picture is stored in "public/data/user-image" folder, where each file is named "(id).png"
    -- default profile picture is "default.png" which is the discbro logo with colors behind it
    -- every profile picture should be max 256x256

    theme TINYINT, -- 0: dark (default), 1: midnight, 2: light, 3: dark more contrast, more to be added

    created_time UNSIGNED INT NOT NULL DEFAULT (strftime('%s', 'now'))
);

create table friends (
    -- Each pair of friends gets a dm, as a "friend_group" with two members
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id UNSIGNED INT NOT NULL, -- user1 is the one who sent the request
    user2_id UNSIGNED INT NOT NULL,
    status TINYINT -- 0: pending, 1: accepted
    -- if request is denied, this entry is deleted
);

create table servers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id UNSIGNED INT REFERENCES users(id),
    name varchar(64) NOT NULL,
    image varchar(128), -- if null, use default smiling image

    created_time UNSIGNED INT NOT NULL DEFAULT (strftime('%s', 'now'))
);

create table roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name varchar(64) NOT NULL,
    color varchar(7) NOT NULL, -- hex for now
    server_id UNSIGNED INT REFERENCES servers(id), -- which server it exists in

    admin TINYINT NOT NULL -- 0: no admin 😂, 1: admin 😎
    -- add more perms later, admin just has all perms for now
);

create table members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id UNSIGNED INT REFERENCES servers(id),
    user_id UNSIGNED INT REFERENCES users(id),

    joined_time UNSIGNED INT NOT NULL DEFAULT (strftime('%s', 'now'))
);

create table member_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id UNSIGNED INT REFERENCES members(id), -- the member that has this role, specifies both user and server! this dissapears after leaving a server too ❤
    role_id UNSIGNED INT REFERENCES roles(id) -- and the role the member has, a member can have as many as they like
);

create table categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name varchar(63) NOT NULL,
    
    server_id UNSIGNED INT REFERENCES servers(id)
);

create table channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name varchar(63) NOT NULL,
    
    server_id UNSIGNED INT NOT NULL REFERENCES servers(id),
    category_id UNSIGNED INT REFERENCES categories(id), -- can be category-less, and just in a server
    created_time UNSIGNED INT NOT NULL DEFAULT (strftime('%s', 'now'))
);

create table messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id UNSIGNED INT NOT NULL REFERENCES channels(id),
    author_id INT NOT NULL REFERENCES users(id),

    content varchar(2048) NOT NULL,
    time UNSIGNED INT NOT NULL DEFAULT (strftime('%s', 'now'))
);