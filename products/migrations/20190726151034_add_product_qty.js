
exports.up = function (knex) {
  return knex.schema.table('products', table => {
    table.integer('qty').notNull().defaultTo(100)
  })
}

exports.down = function (knex) {
  return knex.schema.table('products', (table) => {
    table.dropColumn('qty')
  })
}
