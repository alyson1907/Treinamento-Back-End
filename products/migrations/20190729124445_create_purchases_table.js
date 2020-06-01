exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('purchases', (table) => {
      table.increments('id').primary()
      table.float('totalPrice').notNull()
      table.string('rg', 10).notNull() // sempre teremos acesso ao RG pois o usuario deve estar logado para fazer uma compra (token)
    }),

    knex.schema.createTable('itemsPurchased', (table) => {
      table.string('itemCode', 128)
      table.string('qty', 128).notNull()
      table.integer('purchaseId').unsigned().notNull()

      table.foreign('purchaseId').references('id').inTable('purchases').onDelete('CASCADE').onUpdate('CASCADE')
      table.foreign('itemCode').references('code').inTable('products').onDelete('SET NULL').onUpdate('CASCADE')
    })
  ])
}

exports.down = function (knex) {
  return Promise.all([
    knex.schema.dropTable('itemsPurchased'),
    knex.schema.dropTable('purchases')
  ])
}
