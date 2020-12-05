// knex queries
// http://perkframework.com/v1/guides/database-migrations-knex.html
const db = require('../dbConfig');

module.exports = {
    addUser,
    findVerifiedUsernames,
    findUserByEmail,
    findUser,
    findUserByUsername,
    upgradeUser,
    deleteUserDB,
    addGift,
    deleteGift,
    saveGiftChanges
};

async function addUser(user, uuid) {
    return await db("users").insert({
        uuid: uuid,
        role: "temp_user",
        profilePicture: "",
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        salt: user.salt,
        code: user.code,
        password: user.hashedPassword,
        followers: JSON.stringify([]),
        followerTotal: 0,
        following: JSON.stringify([]),
        followingTotal: 0,
        giftList: JSON.stringify([])
    }, ["email", "username"])
}

async function findVerifiedUsernames() {
    return await db("users")
        .select('username')
        .where({role: "user"})
}

async function findUser(email, username) {
    return await db("users")
        .where({
            email: email,
            username: username
        })
        .first()
}

async function findUserByEmail(email) {
    return await db("users")
        .where({email: email})
        .first()
}

async function findUserByUsername(username) {
    return await db("users")
        .where({"username": username})
        .first()
}

async function upgradeUser(email) {
    return await db("users")
        .where({email: email})
        .update({role: "user"})
}

async function deleteUserDB() {
    return await db("users").del();
}

async function addGift(email, newGift) {
    let user = await db("users")    // gets the user's information
        .where({email: email})
        .first()

    if (user.giftList) {    // non empty gift list
        let userGiftList = eval(user.giftList)  // convert json string to javascript object
        userGiftList.push(newGift)  // add the new gift

        return await db("users")
            .where({email: email})
            .update({giftList: JSON.stringify(userGiftList)})
    } else {    // empty gift list
        let newGiftList = []
        newGiftList.push(newGift)

        return await db("users")
            .where({email: email})
            .update({giftList: JSON.stringify(newGiftList)})
    }
}

async function deleteGift(email, index) {
    let user = await db("users")
        .where({email: email})
        .first()

    let userGiftList = eval(user.giftList);
    let deletedGift = userGiftList.splice(index, 1);

    return await db("users")
        .where({email: email})
        .update({giftList: JSON.stringify(userGiftList)})
}

async function saveGiftChanges(email, index, giftChanges) {
    let user = await db("users")
    .where({email: email})
    .first()

    let userGiftList = eval(user.giftList);
    userGiftList[index] = giftChanges;

    return await db("users")
        .where({email: email})
        .update({giftList: JSON.stringify(userGiftList)})

}