
exports.up = function(knex) {
  return knex.schema.createTable("teams", (table)=> {
    table.increments("id").primary()
    table.integer("user_id").unsigned().notNullable()
    table.decimal("budget", 15, 2).defaultTo(5000000)
    table.timestamp("created_at").defaultTo(knex.fn.now())

    table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE")
  })
};

exports.down = function(knex) {
  return knex.drop.schema.dropTable("teams")
};
