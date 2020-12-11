create table users(
    id SERIAL,
    uuid TEXT PRIMARY KEY UNIQUE,
    role VARCHAR(20),
    profilePicture TEXT,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    password VARCHAR(128),
    code VARCHAR(30),
    followers TEXT [],
    followerTotal INT,
    following TEXT [],
    followingTotal INT,
    giftlist JSONB
);