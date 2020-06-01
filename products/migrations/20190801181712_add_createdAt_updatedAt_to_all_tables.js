
exports.up = function (knex) {
  return Promise.all([
    // categorias e produtos
    knex.schema.table('categories', (table) => {
      table.string('createdAt')
      table.string('updatedAt')
    }),

    knex.schema.table('products', (table) => {
      table.string('createdAt')
      table.string('updatedAt')
    }),

    // compras
    knex.schema.table('purchases', (table) => {
      table.string('createdAt')
      table.string('updatedAt')
    }),

    knex.schema.table('itemsPurchased', (table) => {
      table.string('createdAt')
      table.string('updatedAt')
    })

  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('categories', (table) => {
      table.dropColumn('createdAt')
      table.dropColumn('updatedAt')
    }),

    knex.schema.table('products', (table) => {
      table.dropColumn('createdAt')
      table.dropColumn('updatedAt')
    }),

    knex.schema.table('purchases', (table) => {
      table.dropColumn('createdAt')
      table.dropColumn('updatedAt')
    }),
    knex.schema.table('itemsPurchased', (table) => {
      table.dropColumn('createdAt')
      table.dropColumn('updatedAt')
    })
  ])
}
