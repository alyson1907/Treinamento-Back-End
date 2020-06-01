
module.exports = {
  local: {
    client: 'mysql',
	  connection: {
      host: 'localhost',
      database : 'mydb',
      user: 'root'
    }
  },
  development: {
    client: 'mysql',
    connection: {
      host: '159.89.157.75',
      database: 'alyssondb',
      user: 'root',
      password: 'servidorsalutestrongpass'
    }
  }
}
