
exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.string('createdAt')
      table.string('updatedAt')
    }),

    knex.schema.table('accounts', (table) => {
      table.string('createdAt')
      table.string('updatedAt')
    })
  ])
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('createdAt')
      table.dropColumn('updatedAt')
  }),

    knex.schema.table('accounts', (table) => {
      table.dropColumn('createdAt')
      table.dropColumn('updatedAt')
    })
  ])
};
