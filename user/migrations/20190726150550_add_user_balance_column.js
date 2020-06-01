
exports.up = function(knex) {
    return knex.schema.table('users', (table) => {
        table.float('balance').notNull().defaultTo(5000)
    })
};

exports.down = function(knex) {
    return knex.schema.table('users', (table) => {
        table.dropColumn('balance');
    });
};
