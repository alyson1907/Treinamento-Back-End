
exports.up = function (knex) {
  return Promise.all([
    knex.schema.createTable('users', (table) => {
      table.string('rg', 10).primary()
      table.string('name')
      table.integer('age')
    }),

    knex.schema.createTable('accounts', (table) => {
      table.string('email', 64).primary()
      table.string('password')
      table.string('userRg', 10)
      table.foreign('userRg').references('users.rg').onDelete('CASCADE').onUpdate('CASCADE')
    })
  ])
};

exports.down = function (knex) {
  knex.schema.dropTable('accounts')
    knex.schema.dropTable('users')
};
