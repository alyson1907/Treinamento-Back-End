
exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('categories', (table) => {
      table.string('name', 128).primary()
    }),

    knex.schema.createTable('products', (table) => {
      table.string('code', 128).primary()
      table.string('description')
      table.float('price').notNullable()
      table.string('category', 128)
      table.foreign('category').references('categories.name').onDelete('SET NULL').onUpdate('CASCADE')
    })
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable('products'),
    knex.schema.dropTable('categories')
  ])
}
