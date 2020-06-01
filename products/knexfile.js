module.exports = {
  local: {
    client: 'mysql',
    connection: {
      host: 'localhost',
      database: 'prod_db',
      user: 'root'
    }
  },
  development: {
    client: 'mysql',
    connection: {
      host: '159.89.157.75',
      database: 'alysonprod',
      user: 'root',
      password: 'servidorsalutestrongpass'
    }
  }
}
