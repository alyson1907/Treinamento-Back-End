
exports.up = function (knex) {
  return knex.schema.table('products', table => {
    table.string('img')
  })
}

exports.down = function (knex) {
  return knex.schema.table('products', (table) => {
    table.dropColumn('img')
  })
}
