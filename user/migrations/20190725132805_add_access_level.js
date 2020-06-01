
exports.up = function(knex) {
    return knex.schema.table('accounts', (table) => {
        table.string('accessLevel').notNull().defaultTo('user');
    });
};

exports.down = function(knex) {
    return knex.schema.table('accounts', (table) => {
        table.dropColumn('accessLevel');
    });
};
