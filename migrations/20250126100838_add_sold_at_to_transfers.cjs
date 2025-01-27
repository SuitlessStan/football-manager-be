exports.up = function (knex) {
  return knex.schema.table("transfers", (table) => {
    table.timestamp("sold_at").nullable().after("is_sold");
  });
};

exports.down = function (knex) {
  return knex.schema.table("transfers", (table) => {
    table.dropColumn("sold_at");
  });
};
