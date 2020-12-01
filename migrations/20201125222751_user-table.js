exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments("id")
        table.uuid("uuid")
        table.text("role")
        table.text("profilePicture")
        table.text("username").notNullable().unique()
        table.text("firstname")
        table.text("lastname")
        table.text("email").notNullable().unique()
        table.text("salt")
        table.text("code")
        table.text("password")
        table.json("followers")
        table.integer("followerTotal")
        table.json("following")
        table.integer("followingTotal")
        table.json("giftList")
        table.timestamps(true, true)
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users')
};
