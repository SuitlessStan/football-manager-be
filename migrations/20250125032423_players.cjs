
exports.up = function(knex) {
  return knex.schema.createTable("players", (table) => {
    table.increments("id").primary()
    table.integer("team_id").unsigned().nullable()
    table.string("name").notNullable()
    table.enu("position", ["Goalkeeper", "Defender", "Midfielder", "Attacker"]).notNullable()
    table.decimal("price", 15, 2).notNullable()
    table.timestamp("created_at").defaultTo(knex.fn.now())

    table.foreign("team_id").references("id").inTable("teams").onDelete("SET NULL")
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable("players")
};
