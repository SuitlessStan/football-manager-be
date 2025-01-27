
exports.up = function(knex) {
  return knex.schema.createTable("transfers", (table) => {
    table.increments("id").primary()
    table.integer("player_id").unsigned().notNullable()
    table.decimal("asking_price", 15, 2).notNullable()
    table.boolean("is_sold").defaultTo(false)
    table.timestamp("created_at").defaultTo(knex.fn.now())

    table.foreign("player_id").references("id").inTable("players").onDelete("CASCADE")
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable("transfers")
};
