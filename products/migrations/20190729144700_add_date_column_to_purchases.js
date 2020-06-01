
exports.up = function (knex) {
  return knex.schema.table('purchases', table => {
    table.string('date')
  })
}

exports.down = function (knex) {
  return knex.schema.table('purchases', (table) => {
    table.dropColumn('date')
  })
}
